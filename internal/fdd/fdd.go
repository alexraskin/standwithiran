package fdd

import (
	"context"
	"crypto/md5"
	"encoding/csv"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/alexraskin/standwithiran/internal/database"
	"github.com/alexraskin/standwithiran/internal/models"
)

const (
	FDDDataURL   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTT_uQv7JKEk8An8zPxdgcwxRPNTuypy7XAZcavbSAqnKyHlFD1nB5yJ1Zaa9HiFXVchC9tEy4OPQv/pub?gid=0&single=true&output=csv"
	SyncInterval = 1 * time.Hour
)

type Syncer struct {
	db database.Database
}

func NewSyncer(db database.Database) *Syncer {
	return &Syncer{db: db}
}

func (s *Syncer) Start(ctx context.Context) {
	// Initial sync
	if err := s.SyncData(ctx); err != nil {
		slog.Error("Initial FDD data sync failed", "error", err)
	}

	ticker := time.NewTicker(SyncInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := s.SyncData(ctx); err != nil {
				slog.Error("FDD data sync failed", "error", err)
			}
		}
	}
}

func (s *Syncer) SyncData(ctx context.Context) error {
	slog.Info("Starting FDD protest data sync")

	resp, err := http.Get(FDDDataURL)
	if err != nil {
		return fmt.Errorf("failed to fetch FDD data: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("FDD data fetch returned status %d", resp.StatusCode)
	}

	reader := csv.NewReader(resp.Body)
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to parse CSV: %w", err)
	}

	if len(records) < 2 {
		return fmt.Errorf("CSV has no data rows")
	}

	// Parse header to get column indices
	header := records[0]
	colMap := make(map[string]int)
	for i, col := range header {
		colMap[strings.TrimSpace(col)] = i
	}

	var protests []models.Protest
	for i, record := range records[1:] {
		if len(record) == 0 {
			continue
		}

		protest, err := s.parseRecord(record, colMap, i)
		if err != nil {
			slog.Warn("Failed to parse protest record", "row", i+2, "error", err)
			continue
		}

		protests = append(protests, protest)
	}

	if len(protests) == 0 {
		return fmt.Errorf("no valid protest records found")
	}

	if err := s.db.UpsertProtests(ctx, protests); err != nil {
		return fmt.Errorf("failed to upsert protests: %w", err)
	}

	if err := s.db.UpdateProtestsLastSync(ctx); err != nil {
		slog.Error("Failed to update sync timestamp", "error", err)
	}

	slog.Info("FDD protest data sync completed", "count", len(protests))
	return nil
}

func (s *Syncer) parseRecord(record []string, colMap map[string]int, rowIndex int) (models.Protest, error) {
	getCol := func(name string) string {
		if idx, ok := colMap[name]; ok && idx < len(record) {
			return strings.TrimSpace(record[idx])
		}
		return ""
	}

	// Required fields
	date := getCol("Date")
	province := getCol("Province")

	if date == "" || province == "" {
		return models.Protest{}, fmt.Errorf("missing required fields")
	}

	// Generate ID from date + location + row
	idStr := fmt.Sprintf("fdd-%s-%s-%d", date, province, rowIndex)
	hash := md5.Sum([]byte(idStr))
	id := hex.EncodeToString(hash[:])[:16]

	lat, _ := strconv.ParseFloat(getCol("Latitude"), 64)
	lng, _ := strconv.ParseFloat(getCol("Longitude"), 64)
	size, _ := strconv.Atoi(getCol("Estimated_Size"))
	injured, _ := strconv.Atoi(getCol("Injured"))
	arrested, _ := strconv.Atoi(getCol("Arrested"))
	killed, _ := strconv.Atoi(getCol("Killed"))

	return models.Protest{
		ID:            id,
		Date:          date,
		CityVillage:   getCol("City_Village"),
		County:        getCol("County"),
		Province:      province,
		Latitude:      lat,
		Longitude:     lng,
		EstimatedSize: size,
		Description:   getCol("Description"),
		Injured:       injured,
		Arrested:      arrested,
		Killed:        killed,
		Link:          getCol("Link"),
		MediaURL:      getCol("MediaURL"),
		Source:        getCol("Source"),
		IsCustom:      false,
	}, nil
}
