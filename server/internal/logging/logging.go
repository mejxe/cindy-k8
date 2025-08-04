package logging

import (
	"log"
	"os"
)

const (
	colorReset  = "\033[0m"
	colorBlue   = "\033[34m"
	colorRed    = "\033[31m"
	colorYellow = "\033[33m"
	colorGreen  = "\033[32m"
)

var (
	Info    = log.New(os.Stdout, colorBlue+"[INFO] "+colorReset, log.Ltime)
	Warning = log.New(os.Stdout, colorYellow+"[WARN] "+colorReset, log.Ltime)
	Error   = log.New(os.Stderr, colorRed+"[ERROR] "+colorReset, log.Ltime)
	Success = log.New(os.Stdout, colorGreen+"[SUCCESS] "+colorReset, log.Ltime)
)
