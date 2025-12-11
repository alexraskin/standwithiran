package server

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/alexraskin/standwithiran/internal/database"
	"github.com/alexraskin/standwithiran/internal/models"
)

type MockDatabase struct {
	profile       models.Profile
	links         []models.Link
	banner        models.Banner
	password      string
	profileErr    error
	linksErr      error
	bannerErr     error
	verifyErr     error
	addLinkErr    error
	deleteLinkErr error
	updateErr     error
}

func (m *MockDatabase) Close() {}

func (m *MockDatabase) GetProfile(ctx context.Context) (models.Profile, error) {
	return m.profile, m.profileErr
}

func (m *MockDatabase) UpdateProfile(ctx context.Context, p models.Profile) error {
	m.profile = p
	return m.updateErr
}

func (m *MockDatabase) GetLinks(ctx context.Context) ([]models.Link, error) {
	return m.links, m.linksErr
}

func (m *MockDatabase) AddLink(ctx context.Context, l models.Link) error {
	m.links = append(m.links, l)
	return m.addLinkErr
}

func (m *MockDatabase) DeleteLink(ctx context.Context, id string) error {
	return m.deleteLinkErr
}

func (m *MockDatabase) UpdateLinkFeatured(ctx context.Context, id string, featured bool) error {
	return m.updateErr
}

func (m *MockDatabase) VerifyPassword(ctx context.Context, password string) (bool, error) {
	if m.verifyErr != nil {
		return false, m.verifyErr
	}
	return password == m.password, nil
}

func (m *MockDatabase) SetPassword(ctx context.Context, password string) error {
	m.password = password
	return m.updateErr
}

func (m *MockDatabase) GetBanner(ctx context.Context) (models.Banner, error) {
	return m.banner, m.bannerErr
}

func (m *MockDatabase) UpdateBanner(ctx context.Context, b models.Banner) error {
	m.banner = b
	return m.updateErr
}

func mockTemplateFunc(wr io.Writer, name string, data any) error {
	_, err := wr.Write([]byte("rendered: " + name))
	return err
}

func newTestServer(db database.Database) *Server {
	return &Server{
		version:  "test",
		port:     "8080",
		tmplFunc: mockTemplateFunc,
		sessions: make(map[string]time.Time),
		db:       db,
	}
}

func TestFormatBuildVersion(t *testing.T) {
	version := FormatBuildVersion("1.0.0")
	if !strings.Contains(version, "1.0.0") {
		t.Errorf("expected version string to contain '1.0.0', got %q", version)
	}
	if !strings.Contains(version, "Go Version:") {
		t.Errorf("expected version string to contain 'Go Version:', got %q", version)
	}
}

func TestSessionCreateAndValidate(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	token := s.createSession()
	if token == "" {
		t.Fatal("createSession returned empty token")
	}
	if len(token) != 64 { // 32 bytes hex encoded = 64 chars
		t.Errorf("expected token length 64, got %d", len(token))
	}

	if !s.validateSession(token) {
		t.Error("expected session to be valid")
	}

	if s.validateSession("invalid-token") {
		t.Error("expected invalid token to fail validation")
	}
}

func TestSessionDelete(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	token := s.createSession()
	if !s.validateSession(token) {
		t.Fatal("session should be valid before deletion")
	}

	s.deleteSession(token)

	if s.validateSession(token) {
		t.Error("session should be invalid after deletion")
	}
}

func TestSessionExpiry(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	token := s.createSession()

	// Manually expire the session
	s.sessionsMu.Lock()
	s.sessions[token] = time.Now().Add(-1 * time.Hour)
	s.sessionsMu.Unlock()

	if s.validateSession(token) {
		t.Error("expired session should be invalid")
	}
}

func TestGetSessionFromRequest(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	// No cookie
	req := httptest.NewRequest("GET", "/", nil)
	token := s.getSessionFromRequest(req)
	if token != "" {
		t.Errorf("expected empty token, got %q", token)
	}

	// With cookie
	req = httptest.NewRequest("GET", "/", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "test-token"})
	token = s.getSessionFromRequest(req)
	if token != "test-token" {
		t.Errorf("expected 'test-token', got %q", token)
	}
}

func TestHandleIndex(t *testing.T) {
	db := &MockDatabase{
		profile: models.Profile{Name: "Test Site"},
		links: []models.Link{
			{ID: "1", Title: "Link 1"},
		},
		banner: models.Banner{Enabled: false},
	}
	s := newTestServer(db)

	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	s.HandleIndex(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "index.html") {
		t.Error("expected index.html template to be rendered")
	}
}

func TestHandleLoginPage(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	req := httptest.NewRequest("GET", "/admin/login", nil)
	w := httptest.NewRecorder()

	s.HandleLoginPage(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "login.html") {
		t.Error("expected login.html template to be rendered")
	}
}

func TestHandleLoginPageRedirectIfLoggedIn(t *testing.T) {
	s := newTestServer(&MockDatabase{})
	token := s.createSession()

	req := httptest.NewRequest("GET", "/admin/login", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: token})
	w := httptest.NewRecorder()

	s.HandleLoginPage(w, req)

	if w.Code != http.StatusSeeOther {
		t.Errorf("expected redirect status 303, got %d", w.Code)
	}
}

func TestHandleLoginSuccess(t *testing.T) {
	db := &MockDatabase{password: "correct-password"}
	s := newTestServer(db)

	form := url.Values{}
	form.Set("password", "correct-password")
	req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()

	s.HandleLogin(w, req)

	if w.Code != http.StatusSeeOther {
		t.Errorf("expected redirect status 303, got %d", w.Code)
	}

	// Check session cookie was set
	cookies := w.Result().Cookies()
	found := false
	for _, c := range cookies {
		if c.Name == "session" && c.Value != "" {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected session cookie to be set")
	}
}

func TestHandleLoginFailure(t *testing.T) {
	db := &MockDatabase{password: "correct-password"}
	s := newTestServer(db)

	form := url.Values{}
	form.Set("password", "wrong-password")
	req := httptest.NewRequest("POST", "/admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()

	s.HandleLogin(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "login.html") {
		t.Error("expected login page to be re-rendered")
	}
}

func TestHandleLogout(t *testing.T) {
	s := newTestServer(&MockDatabase{})
	token := s.createSession()

	req := httptest.NewRequest("POST", "/admin/logout", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: token})
	w := httptest.NewRecorder()

	s.HandleLogout(w, req)

	if w.Code != http.StatusSeeOther {
		t.Errorf("expected redirect status 303, got %d", w.Code)
	}

	// Session should be deleted
	if s.validateSession(token) {
		t.Error("session should be invalid after logout")
	}
}

func TestHandleAddLinkMissingFields(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	form := url.Values{}
	form.Set("title", "")
	form.Set("url", "")
	req := httptest.NewRequest("POST", "/admin/links/add", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()

	s.HandleAddLink(w, req)

	if w.Code != http.StatusSeeOther {
		t.Errorf("expected redirect, got %d", w.Code)
	}
	location := w.Header().Get("Location")
	if !strings.Contains(location, "error=") {
		t.Error("expected error in redirect URL")
	}
}

func TestHandleAddLinkSuccess(t *testing.T) {
	db := &MockDatabase{}
	s := newTestServer(db)

	form := url.Values{}
	form.Set("title", "Test Link")
	form.Set("url", "https://example.com")
	form.Set("category", "fundraiser")
	form.Set("icon", "💰")
	req := httptest.NewRequest("POST", "/admin/links/add", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()

	s.HandleAddLink(w, req)

	if w.Code != http.StatusSeeOther {
		t.Errorf("expected redirect, got %d", w.Code)
	}
	location := w.Header().Get("Location")
	if !strings.Contains(location, "message=") {
		t.Error("expected success message in redirect URL")
	}
	if len(db.links) != 1 {
		t.Errorf("expected 1 link to be added, got %d", len(db.links))
	}
}

func TestHandleUpdatePasswordTooShort(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	form := url.Values{}
	form.Set("new_password", "12345") // Less than 6 chars
	req := httptest.NewRequest("POST", "/admin/password", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()

	s.HandleUpdatePassword(w, req)

	location := w.Header().Get("Location")
	if !strings.Contains(location, "error=") {
		t.Error("expected error for short password")
	}
}

func TestRequireAuthMiddleware(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	called := false
	handler := s.RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	}))

	// Without session - should redirect
	req := httptest.NewRequest("GET", "/admin", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if called {
		t.Error("handler should not be called without valid session")
	}
	if w.Code != http.StatusSeeOther {
		t.Errorf("expected redirect, got %d", w.Code)
	}

	// With valid session
	called = false
	token := s.createSession()
	req = httptest.NewRequest("GET", "/admin", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: token})
	w = httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if !called {
		t.Error("handler should be called with valid session")
	}
}

func TestCacheControlMiddleware(t *testing.T) {
	s := newTestServer(&MockDatabase{})

	handler := s.cacheControl(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Static file request
	req := httptest.NewRequest("GET", "/static/style.css", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	cacheHeader := w.Header().Get("Cache-Control")
	if !strings.Contains(cacheHeader, "max-age=86400") {
		t.Errorf("expected cache header for static files, got %q", cacheHeader)
	}

	// Non-static request
	req = httptest.NewRequest("GET", "/", nil)
	w = httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	cacheHeader = w.Header().Get("Cache-Control")
	if !strings.Contains(cacheHeader, "no-cache") {
		t.Errorf("expected no-cache for non-static, got %q", cacheHeader)
	}
}
