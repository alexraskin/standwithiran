package cache

import (
	"sync"
	"time"

	"github.com/alexraskin/standwithiran/internal/models"
)

type Cache struct {
	mu         sync.RWMutex
	profile    *models.Profile
	profileExp time.Time
	links      []models.Link
	linksExp   time.Time
	banner     *models.Banner
	bannerExp  time.Time
	ttl        time.Duration
}

func NewCache(ttl time.Duration) *Cache {
	return &Cache{ttl: ttl}
}

func (c *Cache) GetProfile() (*models.Profile, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if c.profile == nil || time.Now().After(c.profileExp) {
		return nil, false
	}
	return c.profile, true
}

func (c *Cache) SetProfile(p models.Profile) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.profile = &p
	c.profileExp = time.Now().Add(c.ttl)
}

func (c *Cache) GetLinks() ([]models.Link, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if c.links == nil || time.Now().After(c.linksExp) {
		return nil, false
	}
	return c.links, true
}

func (c *Cache) SetLinks(links []models.Link) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.links = links
	c.linksExp = time.Now().Add(c.ttl)
}

func (c *Cache) GetBanner() (*models.Banner, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if c.banner == nil || time.Now().After(c.bannerExp) {
		return nil, false
	}
	return c.banner, true
}

func (c *Cache) SetBanner(b models.Banner) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.banner = &b
	c.bannerExp = time.Now().Add(c.ttl)
}

func (c *Cache) InvalidateProfile() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.profile = nil
}

func (c *Cache) InvalidateLinks() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.links = nil
}

func (c *Cache) InvalidateBanner() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.banner = nil
}
