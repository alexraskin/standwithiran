package server

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"
)

func (s *Server) createSession() string {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		panic("failed to generate session token: " + err.Error())
	}
	token := hex.EncodeToString(bytes)

	s.sessionsMu.Lock()
	s.sessions[token] = time.Now().Add(24 * time.Hour)
	s.sessionsMu.Unlock()

	return token
}

func (s *Server) validateSession(token string) bool {
	s.sessionsMu.RLock()
	expiry, exists := s.sessions[token]
	s.sessionsMu.RUnlock()

	if !exists {
		return false
	}

	if time.Now().After(expiry) {
		s.sessionsMu.Lock()
		delete(s.sessions, token)
		s.sessionsMu.Unlock()
		return false
	}

	return true
}

func (s *Server) deleteSession(token string) {
	s.sessionsMu.Lock()
	delete(s.sessions, token)
	s.sessionsMu.Unlock()
}

func (s *Server) getSessionFromRequest(r *http.Request) string {
	cookie, err := r.Cookie("session")
	if err != nil {
		return ""
	}
	return cookie.Value
}

func (s *Server) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := s.getSessionFromRequest(r)
		if !s.validateSession(token) {
			http.Redirect(w, r, "/admin/login", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, r)
	})
}
