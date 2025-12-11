package main

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alexraskin/standwithiran/internal/database"
	"github.com/alexraskin/standwithiran/server"
)

var (
	version = "dev"
)

//go:embed templates/*.html
var templatesFiles embed.FS

//go:embed static/*
var staticFiles embed.FS

func main() {

	var (
		tmplFunc server.ExecuteTemplateFunc
		assets   http.FileSystem
	)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://localhost:5432/iran?sslmode=disable"
	}

	if dbURL == "" {
		panic("DATABASE_URL is not set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	tmpl, err := template.New("").ParseFS(templatesFiles, "templates/*.html")
	if err != nil {
		panic(fmt.Errorf("failed to parse templates: %w", err))
	}
	tmplFunc = tmpl.ExecuteTemplate
	assets = http.FS(staticFiles)

	db, err := database.NewDatabase(ctx, dbURL)
	if err != nil {
		panic(fmt.Errorf("failed to initialize database: %w", err))
	}
	defer db.Close()

	srv := server.NewServer(version, port, assets, tmplFunc, db)

	go srv.Start()
	defer srv.Close()

	slog.Info("Started server", slog.String("listen_addr", ":"+port))
	si := make(chan os.Signal, 1)
	signal.Notify(si, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-si
	slog.Info("Shutting down server")
}
