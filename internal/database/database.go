package database

import (
	"context"
	"fmt"
	"time"

	"github.com/alexraskin/standwithiran/internal/cache"
	"github.com/alexraskin/standwithiran/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Database interface {
	Close()
	GetProfile(ctx context.Context) (models.Profile, error)
	UpdateProfile(ctx context.Context, p models.Profile) error
	GetLinks(ctx context.Context) ([]models.Link, error)
	AddLink(ctx context.Context, l models.Link) error
	DeleteLink(ctx context.Context, id string) error
	UpdateLinkFeatured(ctx context.Context, id string, featured bool) error
	VerifyPassword(ctx context.Context, password string) (bool, error)
	SetPassword(ctx context.Context, password string) error
	GetBanner(ctx context.Context) (models.Banner, error)
	UpdateBanner(ctx context.Context, b models.Banner) error
}

type database struct {
	db    *pgxpool.Pool
	cache *cache.Cache
}

func NewDatabase(ctx context.Context, dbURL string) (Database, error) {
	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute
	config.HealthCheckPeriod = 1 * time.Minute
	config.ConnConfig.ConnectTimeout = 10 * time.Second

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create database pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &database{
		db:    pool,
		cache: cache.NewCache(60 * time.Minute),
	}, nil
}

func (d *database) Close() {
	d.db.Close()
}

func (d *database) GetProfile(ctx context.Context) (models.Profile, error) {
	if p, ok := d.cache.GetProfile(); ok {
		return *p, nil
	}

	var p models.Profile
	err := d.db.QueryRow(ctx, `SELECT name, title, subtitle, description, avatar FROM profile WHERE id = 1`).
		Scan(&p.Name, &p.Title, &p.Subtitle, &p.Description, &p.Avatar)
	if err != nil {
		return p, err
	}

	d.cache.SetProfile(p)
	return p, nil
}

func (d *database) UpdateProfile(ctx context.Context, p models.Profile) error {
	_, err := d.db.Exec(ctx, `UPDATE profile SET name=$1, title=$2, subtitle=$3, description=$4, avatar=$5 WHERE id=1`,
		p.Name, p.Title, p.Subtitle, p.Description, p.Avatar)
	if err == nil {
		d.cache.InvalidateProfile()
	}
	return err
}

func (d *database) GetLinks(ctx context.Context) ([]models.Link, error) {
	if links, ok := d.cache.GetLinks(); ok {
		return links, nil
	}

	rows, err := d.db.Query(ctx, `SELECT id, title, url, category, icon, featured FROM links ORDER BY featured DESC, sort_order, created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.Link
	for rows.Next() {
		var l models.Link
		if err := rows.Scan(&l.ID, &l.Title, &l.URL, &l.Category, &l.Icon, &l.Featured); err != nil {
			return nil, err
		}
		links = append(links, l)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	d.cache.SetLinks(links)
	return links, nil
}

func (d *database) AddLink(ctx context.Context, l models.Link) error {
	_, err := d.db.Exec(ctx, `INSERT INTO links (id, title, url, category, icon, featured) VALUES ($1, $2, $3, $4, $5, $6)`,
		l.ID, l.Title, l.URL, l.Category, l.Icon, l.Featured)
	if err == nil {
		d.cache.InvalidateLinks()
	}
	return err
}

func (d *database) DeleteLink(ctx context.Context, id string) error {
	_, err := d.db.Exec(ctx, `DELETE FROM links WHERE id = $1`, id)
	if err == nil {
		d.cache.InvalidateLinks()
	}
	return err
}

func (d *database) UpdateLinkFeatured(ctx context.Context, id string, featured bool) error {
	_, err := d.db.Exec(ctx, `UPDATE links SET featured = $1 WHERE id = $2`, featured, id)
	if err == nil {
		d.cache.InvalidateLinks()
	}
	return err
}

func (d *database) VerifyPassword(ctx context.Context, password string) (bool, error) {
	var hashedPassword string
	err := d.db.QueryRow(ctx, `SELECT value FROM settings WHERE key = 'admin_password'`).Scan(&hashedPassword)
	if err != nil {
		return false, err
	}

	if len(hashedPassword) < 60 {
		if password == hashedPassword {
			_ = d.SetPassword(ctx, password)
			return true, nil
		}
		return false, nil
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil, nil
}

func (d *database) SetPassword(ctx context.Context, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(ctx, `UPDATE settings SET value = $1 WHERE key = 'admin_password'`, string(hashedPassword))
	return err
}

func (d *database) GetBanner(ctx context.Context) (models.Banner, error) {
	if b, ok := d.cache.GetBanner(); ok {
		return *b, nil
	}

	var b models.Banner
	var enabled string

	rows, err := d.db.Query(ctx, `SELECT key, value FROM settings WHERE key LIKE 'banner_%'`)
	if err != nil {
		return b, err
	}
	defer rows.Close()

	for rows.Next() {
		var key, value string
		if err := rows.Scan(&key, &value); err != nil {
			return b, err
		}
		switch key {
		case "banner_enabled":
			enabled = value
		case "banner_text":
			b.Text = value
		case "banner_link":
			b.Link = value
		case "banner_type":
			b.Type = value
		}
	}

	b.Enabled = enabled == "true"
	d.cache.SetBanner(b)
	return b, rows.Err()
}

func (d *database) UpdateBanner(ctx context.Context, b models.Banner) error {
	enabled := "false"
	if b.Enabled {
		enabled = "true"
	}

	if _, err := d.db.Exec(ctx, `INSERT INTO settings (key, value) VALUES ('banner_enabled', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, enabled); err != nil {
		return err
	}
	if _, err := d.db.Exec(ctx, `INSERT INTO settings (key, value) VALUES ('banner_text', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, b.Text); err != nil {
		return err
	}
	if _, err := d.db.Exec(ctx, `INSERT INTO settings (key, value) VALUES ('banner_link', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, b.Link); err != nil {
		return err
	}
	if _, err := d.db.Exec(ctx, `INSERT INTO settings (key, value) VALUES ('banner_type', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, b.Type); err != nil {
		return err
	}

	d.cache.InvalidateBanner()
	return nil
}
