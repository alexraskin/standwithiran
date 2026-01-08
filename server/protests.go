package server

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/alexraskin/standwithiran/internal/models"
)

func (s *Server) HandleAddProtest(w http.ResponseWriter, r *http.Request) {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		slog.Error("Failed to generate random ID", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+generate+ID", http.StatusSeeOther)
		return
	}
	id := hex.EncodeToString(bytes)

	protest := models.Protest{
		ID:          id,
		Date:        r.FormValue("date"),
		CityVillage: r.FormValue("city_village"),
		County:      r.FormValue("county"),
		Province:    r.FormValue("province"),
		Description: r.FormValue("description"),
		Link:        r.FormValue("link"),
		Source:      r.FormValue("source"),
		IsCustom:    true,
	}

	// Parse numeric fields
	if lat := r.FormValue("latitude"); lat != "" {
		if err := parseFloat(lat, &protest.Latitude); err != nil {
			http.Redirect(w, r, "/admin?error=Invalid+latitude", http.StatusSeeOther)
			return
		}
	}
	
	if lng := r.FormValue("longitude"); lng != "" {
		if err := parseFloat(lng, &protest.Longitude); err != nil {
			http.Redirect(w, r, "/admin?error=Invalid+longitude", http.StatusSeeOther)
			return
		}
	}
	
	if size := r.FormValue("estimated_size"); size != "" {
		if err := parseInt(size, &protest.EstimatedSize); err != nil {
			http.Redirect(w, r, "/admin?error=Invalid+size", http.StatusSeeOther)
			return
		}
	}

	if err := s.db.AddProtest(r.Context(), protest); err != nil {
		slog.Error("Failed to add protest", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+save+protest", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Protest+added+successfully", http.StatusSeeOther)
}

func (s *Server) HandleDeleteProtest(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("id")

	if err := s.db.DeleteProtest(r.Context(), id); err != nil {
		slog.Error("Failed to delete protest", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+delete+protest", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Protest+deleted", http.StatusSeeOther)
}

func (s *Server) HandleSyncProtests(w http.ResponseWriter, r *http.Request) {
	// Trigger manual sync - this would call the FDD syncer
	// For now, just redirect with a message
	http.Redirect(w, r, "/admin?message=Protest+sync+triggered", http.StatusSeeOther)
}

func parseFloat(s string, dest *float64) error {
	var val float64
	if _, err := fmt.Sscanf(s, "%f", &val); err != nil {
		return err
	}
	*dest = val
	return nil
}

func parseInt(s string, dest *int) error {
	var val int
	if _, err := fmt.Sscanf(s, "%d", &val); err != nil {
		return err
	}
	*dest = val
	return nil
}
