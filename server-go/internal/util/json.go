package util

import (
	"encoding/json"
	"strings"
)

// MarshalForScript marshals value to JSON and escapes closing tags so it can be inlined safely.
func MarshalForScript(v any) (string, error) {
	data, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	escaped := strings.ReplaceAll(string(data), "<", "\\u003c")
	return escaped, nil
}
