package database

import (
	"context"
	"fmt"
	"time"

	"github.com/alexraskin/standwithiran/internal/models"
)

func (d *database) GetProtests(ctx context.Context, limit int) ([]models.Protest, error) {
	query := `
		SELECT id, date::text, city_village, county, province, latitude, longitude, 
		       estimated_size, description, injured, arrested, killed, 
		       link, media_url, source, is_custom
		FROM protests
		WHERE date >= '2025-12-01'
		ORDER BY date DESC, is_custom DESC
	`

	if limit > 0 {
		query += fmt.Sprintf(" LIMIT %d", limit)
	}

	rows, err := d.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var protests []models.Protest
	for rows.Next() {
		var p models.Protest
		err := rows.Scan(
			&p.ID, &p.Date, &p.CityVillage, &p.County, &p.Province,
			&p.Latitude, &p.Longitude, &p.EstimatedSize, &p.Description,
			&p.Injured, &p.Arrested, &p.Killed, &p.Link, &p.MediaURL,
			&p.Source, &p.IsCustom,
		)
		if err != nil {
			return nil, err
		}
		protests = append(protests, p)
	}

	return protests, rows.Err()
}

func (d *database) GetProtestStats(ctx context.Context) (models.ProtestStats, error) {
	var stats models.ProtestStats

	// Get total killed and arrested since Dec 2025
	err := d.db.QueryRow(ctx, `
		SELECT 
			COALESCE(SUM(killed), 0) as total_killed,
			COALESCE(SUM(arrested), 0) as total_arrested
		FROM protests
		WHERE date >= '2025-12-01'
	`).Scan(&stats.TotalKilled, &stats.TotalArrested)

	if err != nil {
		return stats, err
	}

	// For now, set minors killed to a placeholder (FDD data doesn't distinguish minors in all fields)
	// This would need to be calculated from description or a separate field if available
	stats.MinorsKilled = 0

	// Count descriptions mentioning minors/children
	var minorCount int
	err = d.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT id)
		FROM protests
		WHERE date >= '2025-12-01'
		  AND killed > 0
		  AND (description ILIKE '%minor%' OR description ILIKE '%child%' OR description ILIKE '%teenage%')
	`).Scan(&minorCount)

	if err == nil {
		stats.MinorsKilled = minorCount
	}

	stats.SinceDate = "Dec 2025"
	return stats, nil
}

func (d *database) GetRecentProtestVideos(ctx context.Context, limit int) ([]models.Protest, error) {
	query := `
		SELECT id, date::text, city_village, county, province, latitude, longitude, 
		       estimated_size, description, injured, arrested, killed, 
		       link, media_url, source, is_custom
		FROM protests
		WHERE media_url IS NOT NULL AND media_url != '' AND date >= '2025-12-01'
		ORDER BY date DESC
		LIMIT $1
	`

	rows, err := d.db.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var protests []models.Protest
	for rows.Next() {
		var p models.Protest
		err := rows.Scan(
			&p.ID, &p.Date, &p.CityVillage, &p.County, &p.Province,
			&p.Latitude, &p.Longitude, &p.EstimatedSize, &p.Description,
			&p.Injured, &p.Arrested, &p.Killed, &p.Link, &p.MediaURL,
			&p.Source, &p.IsCustom,
		)
		if err != nil {
			return nil, err
		}
		protests = append(protests, p)
	}

	return protests, rows.Err()
}

func (d *database) GetProtestByID(ctx context.Context, id string) (models.Protest, error) {
	var p models.Protest
	err := d.db.QueryRow(ctx, `
		SELECT id, date::text, city_village, county, province, latitude, longitude,
		       estimated_size, description, injured, arrested, killed,
		       link, media_url, source, is_custom
		FROM protests WHERE id = $1
	`, id).Scan(
		&p.ID, &p.Date, &p.CityVillage, &p.County, &p.Province,
		&p.Latitude, &p.Longitude, &p.EstimatedSize, &p.Description,
		&p.Injured, &p.Arrested, &p.Killed, &p.Link, &p.MediaURL,
		&p.Source, &p.IsCustom,
	)
	return p, err
}

func (d *database) AddProtest(ctx context.Context, p models.Protest) error {
	_, err := d.db.Exec(ctx, `
		INSERT INTO protests (
			id, date, city_village, county, province, latitude, longitude,
			estimated_size, description, injured, arrested, killed,
			link, media_url, source, is_custom
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`, p.ID, p.Date, p.CityVillage, p.County, p.Province, p.Latitude, p.Longitude,
		p.EstimatedSize, p.Description, p.Injured, p.Arrested, p.Killed,
		p.Link, p.MediaURL, p.Source, p.IsCustom)

	if err == nil {
		_ = d.UpdateLastUpdated(ctx)
	}
	return err
}

func (d *database) UpdateProtest(ctx context.Context, p models.Protest) error {
	_, err := d.db.Exec(ctx, `
		UPDATE protests SET
			date = $2, city_village = $3, county = $4, province = $5,
			latitude = $6, longitude = $7, estimated_size = $8,
			description = $9, injured = $10, arrested = $11, killed = $12,
			link = $13, media_url = $14, source = $15, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`, p.ID, p.Date, p.CityVillage, p.County, p.Province, p.Latitude, p.Longitude,
		p.EstimatedSize, p.Description, p.Injured, p.Arrested, p.Killed,
		p.Link, p.MediaURL, p.Source)

	if err == nil {
		_ = d.UpdateLastUpdated(ctx)
	}
	return err
}

func (d *database) DeleteProtest(ctx context.Context, id string) error {
	_, err := d.db.Exec(ctx, `DELETE FROM protests WHERE id = $1`, id)
	if err == nil {
		_ = d.UpdateLastUpdated(ctx)
	}
	return err
}

func (d *database) UpsertProtests(ctx context.Context, protests []models.Protest) error {
	tx, err := d.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for _, p := range protests {
		_, err := tx.Exec(ctx, `
			INSERT INTO protests (
				id, date, city_village, county, province, latitude, longitude,
				estimated_size, description, injured, arrested, killed,
				link, media_url, source, is_custom
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
			ON CONFLICT (id) DO UPDATE SET
				date = EXCLUDED.date,
				city_village = EXCLUDED.city_village,
				county = EXCLUDED.county,
				province = EXCLUDED.province,
				latitude = EXCLUDED.latitude,
				longitude = EXCLUDED.longitude,
				estimated_size = EXCLUDED.estimated_size,
				description = EXCLUDED.description,
				injured = EXCLUDED.injured,
				arrested = EXCLUDED.arrested,
				killed = EXCLUDED.killed,
				link = EXCLUDED.link,
				media_url = EXCLUDED.media_url,
				source = EXCLUDED.source,
				updated_at = CURRENT_TIMESTAMP
			WHERE protests.is_custom = FALSE
		`, p.ID, p.Date, p.CityVillage, p.County, p.Province, p.Latitude, p.Longitude,
			p.EstimatedSize, p.Description, p.Injured, p.Arrested, p.Killed,
			p.Link, p.MediaURL, p.Source, false)

		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (d *database) GetProtestsLastSync(ctx context.Context) (time.Time, error) {
	var timestampStr string
	err := d.db.QueryRow(ctx, `SELECT value FROM settings WHERE key = 'protests_last_sync'`).Scan(&timestampStr)
	if err != nil {
		return time.Time{}, err
	}

	var timestamp int64
	if _, err := fmt.Sscanf(timestampStr, "%d", &timestamp); err != nil {
		return time.Time{}, err
	}

	return time.Unix(timestamp, 0), nil
}

func (d *database) UpdateProtestsLastSync(ctx context.Context) error {
	timestamp := time.Now().Unix()
	_, err := d.db.Exec(ctx,
		`INSERT INTO settings (key, value) VALUES ('protests_last_sync', $1) ON CONFLICT (key) DO UPDATE SET value = $1`,
		fmt.Sprintf("%d", timestamp))
	return err
}
