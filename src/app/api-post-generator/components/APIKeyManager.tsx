"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { validateApiKey } from "./AIIntegration";

interface APIKeyManagerProps {
  onApiKeyChange?: (apiKey: string) => void;
}

export default function APIKeyManager({ onApiKeyChange }: APIKeyManagerProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "valid" | "invalid" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      if (validateApiKey(savedApiKey)) {
        setValidationStatus("valid");
      }
    }
  }, []);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setValidationStatus("idle");
    setErrorMessage("");

    if (value) {
      localStorage.setItem("openai_api_key", value);
    } else {
      localStorage.removeItem("openai_api_key");
    }

    onApiKeyChange?.(value);
  };

  const validateApiKeyWithAPI = async () => {
    if (!apiKey.trim()) {
      setValidationStatus("invalid");
      setErrorMessage("API key is required");
      return;
    }

    if (!validateApiKey(apiKey)) {
      setValidationStatus("invalid");
      setErrorMessage("Invalid API key format");
      return;
    }

    setIsValidating(true);
    setValidationStatus("idle");

    try {
      // Test the API key with a minimal request
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: "Test",
              },
            ],
            max_tokens: 5,
          }),
        }
      );

      if (response.ok) {
        setValidationStatus("valid");
        setErrorMessage("");
      } else {
        const errorData = await response.json();
        setValidationStatus("invalid");
        setErrorMessage(errorData.error?.message || "Invalid API key");
      }
    } catch (error) {
      console.log(error);
      setValidationStatus("error");
      setErrorMessage("Failed to validate API key. Check your connection.");
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Key className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (validationStatus) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      case "error":
        return <Badge className="bg-yellow-100 text-yellow-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Validated</Badge>;
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-600" />
            OpenAI API Configuration
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <Button
              variant="outline"
              onClick={validateApiKeyWithAPI}
              disabled={!apiKey.trim() || isValidating}
              className="flex items-center gap-2 bg-transparent"
            >
              {getStatusIcon()}
              {isValidating ? "Validating..." : "Validate"}
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {validationStatus === "valid" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              API key is valid and ready to use for content generation.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            • Get your API key from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
          <p>• Your API key is stored locally and never sent to our servers</p>
          <p>• Usage will be charged to your OpenAI account</p>
        </div>
      </CardContent>
    </Card>
  );
}
