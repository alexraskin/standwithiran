package cache

import (
	"testing"
	"time"

	"github.com/alexraskin/standwithiran/internal/models"
)

func TestNewCache(t *testing.T) {
	c := NewCache(5 * time.Minute)
	if c == nil {
		t.Fatal("NewCache returned nil")
	}
	if c.ttl != 5*time.Minute {
		t.Errorf("expected ttl 5m, got %v", c.ttl)
	}
}

func TestCacheProfile(t *testing.T) {
	c := NewCache(1 * time.Hour)

	// Initially empty
	p, ok := c.GetProfile()
	if ok || p != nil {
		t.Error("expected empty profile cache")
	}

	// Set profile
	profile := models.Profile{
		Name:        "Test",
		Title:       "Test Title",
		Subtitle:    "Test Subtitle",
		Description: "Test Description",
		Avatar:      "/test.png",
	}
	c.SetProfile(profile)

	// Get profile
	p, ok = c.GetProfile()
	if !ok {
		t.Error("expected profile to be cached")
	}
	if p.Name != "Test" {
		t.Errorf("expected name 'Test', got %q", p.Name)
	}

	// Invalidate
	c.InvalidateProfile()
	p, ok = c.GetProfile()
	if ok || p != nil {
		t.Error("expected profile cache to be invalidated")
	}
}

func TestCacheProfileExpiry(t *testing.T) {
	c := NewCache(10 * time.Millisecond)

	profile := models.Profile{Name: "Test"}
	c.SetProfile(profile)

	// Should be cached immediately
	_, ok := c.GetProfile()
	if !ok {
		t.Error("expected profile to be cached")
	}

	// Wait for expiry
	time.Sleep(20 * time.Millisecond)

	_, ok = c.GetProfile()
	if ok {
		t.Error("expected profile cache to have expired")
	}
}

func TestCacheLinks(t *testing.T) {
	c := NewCache(1 * time.Hour)

	// Initially empty
	links, ok := c.GetLinks()
	if ok || links != nil {
		t.Error("expected empty links cache")
	}

	// Set links
	testLinks := []models.Link{
		{ID: "1", Title: "Link 1", URL: "https://example.com"},
		{ID: "2", Title: "Link 2", URL: "https://example.org"},
	}
	c.SetLinks(testLinks)

	// Get links
	links, ok = c.GetLinks()
	if !ok {
		t.Error("expected links to be cached")
	}
	if len(links) != 2 {
		t.Errorf("expected 2 links, got %d", len(links))
	}

	// Invalidate
	c.InvalidateLinks()
	links, ok = c.GetLinks()
	if ok || links != nil {
		t.Error("expected links cache to be invalidated")
	}
}

func TestCacheBanner(t *testing.T) {
	c := NewCache(1 * time.Hour)

	// Initially empty
	b, ok := c.GetBanner()
	if ok || b != nil {
		t.Error("expected empty banner cache")
	}

	// Set banner
	banner := models.Banner{
		Enabled: true,
		Text:    "Test Banner",
		Link:    "https://example.com",
		Type:    "info",
	}
	c.SetBanner(banner)

	// Get banner
	b, ok = c.GetBanner()
	if !ok {
		t.Error("expected banner to be cached")
	}
	if b.Text != "Test Banner" {
		t.Errorf("expected text 'Test Banner', got %q", b.Text)
	}
	if !b.Enabled {
		t.Error("expected banner to be enabled")
	}

	// Invalidate
	c.InvalidateBanner()
	b, ok = c.GetBanner()
	if ok || b != nil {
		t.Error("expected banner cache to be invalidated")
	}
}

func TestCacheConcurrency(t *testing.T) {
	c := NewCache(1 * time.Hour)

	done := make(chan bool)

	// Concurrent writes
	go func() {
		for range 100 {
			c.SetProfile(models.Profile{Name: "Test"})
		}
		done <- true
	}()

	// Concurrent reads
	go func() {
		for range 100 {
			c.GetProfile()
		}
		done <- true
	}()

	// Concurrent invalidations
	go func() {
		for range 100 {
			c.InvalidateProfile()
		}
		done <- true
	}()

	// Wait for all goroutines
	for range 3 {
		<-done
	}
}
