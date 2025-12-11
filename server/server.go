package server

import (
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/alexraskin/standwithiran/internal/database"
)

type ExecuteTemplateFunc func(wr io.Writer, name string, data any) error

type Server struct {
	version    string
	port       string
	server     *http.Server
	assets     http.FileSystem
	tmplFunc   ExecuteTemplateFunc
	sessions   map[string]time.Time
	sessionsMu sync.RWMutex
	db         *database.Database
}

func NewServer(version string, port string, assets http.FileSystem, tmplFunc ExecuteTemplateFunc, db *database.Database) *Server {

	s := &Server{
		version:    version,
		port:       port,
		assets:     assets,
		tmplFunc:   tmplFunc,
		sessions:   make(map[string]time.Time),
		sessionsMu: sync.RWMutex{},
		db:         db,
	}

	s.server = &http.Server{
		Addr:    ":" + port,
		Handler: s.Routes(),
	}

	return s
}

func (s *Server) Start() {
	if err := s.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("Error while listening", slog.Any("err", err))
		os.Exit(-1)
	}
}

func (s *Server) Close() {
	if err := s.server.Close(); err != nil {
		slog.Error("Error while closing server", slog.Any("err", err))
	}
}

func FormatBuildVersion(version string) string {
	return fmt.Sprintf("Go Version: %s\nVersion: %s\nOS/Arch: %s/%s", runtime.Version(), version, runtime.GOOS, runtime.GOARCH)
}
