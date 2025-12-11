package server

import (
	"errors"
	"fmt"
	"io"
	"net/http"
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
	db         database.Database
}

func NewServer(version string, port string, assets http.FileSystem, tmplFunc ExecuteTemplateFunc, db database.Database) *Server {

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
		panic(err)
	}
}

func (s *Server) Close() {
	if err := s.server.Close(); err != nil {
		panic(err)
	}
}

func FormatBuildVersion(version string) string {
	return fmt.Sprintf("Go Version: %s\nVersion: %s\nOS/Arch: %s/%s", runtime.Version(), version, runtime.GOOS, runtime.GOARCH)
}
