package server

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
)

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(middleware.Compress(5))
	r.Use(httprate.Limit(500, time.Minute))
	r.Use(middleware.Heartbeat("/health"))
	r.Use(s.cacheControl)

	r.Mount("/static", http.FileServer(s.assets))

	r.Handle("/robots.txt", s.serveFile("static/robots.txt"))
	r.Handle("/favicon.ico", s.serveFile("static/images/favicon.ico"))

	r.Get("/", s.HandleIndex)
	r.Get("/admin/login", s.HandleLoginPage)
	r.Post("/admin/login", s.HandleLogin)
	r.Get("/admin/logout", s.HandleLogout)

	r.Group(func(r chi.Router) {
		r.Use(s.RequireAuth)
		r.Get("/admin", s.HandleAdmin)
		r.Post("/admin/links/add", s.HandleAddLink)
		r.Post("/admin/links/delete", s.HandleDeleteLink)
		r.Post("/admin/links/featured", s.HandleToggleFeatured)
		r.Post("/admin/profile", s.HandleUpdateProfile)
		r.Post("/admin/password", s.HandleUpdatePassword)
		r.Post("/admin/banner", s.HandleUpdateBanner)
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/", http.StatusMovedPermanently)
	})

	return r
}
