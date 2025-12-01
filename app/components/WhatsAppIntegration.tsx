"use client";

import { useState } from "react";

export default function WhatsAppIntegration() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/whatsapp/status", {
        method: "GET",
      });

      const data = await response.json();

      if (data.configured) {
        setStatus("success");
        setMessage("WhatsApp integration is active! Send images to the configured WhatsApp number to get recipes.");
      } else {
        setStatus("error");
        setMessage("WhatsApp is not configured. Please set up Twilio credentials in your environment variables.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to check WhatsApp status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">📱 How to use WhatsApp:</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Configure Twilio WhatsApp credentials</li>
          <li>Send an image to the WhatsApp number</li>
          <li>Receive 3 AI-generated recipes instantly</li>
        </ol>
      </div>

      <button
        onClick={handleSubmit}
        disabled={status === "loading"}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
      >
        {status === "loading" ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Checking Status...</span>
          </>
        ) : (
          <>
            <span>Check WhatsApp Status</span>
          </>
        )}
      </button>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            status === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-semibold mb-1">⚙️ Setup Instructions:</p>
        <p>
          To enable WhatsApp integration, configure the following environment variables:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-xs font-mono bg-white p-2 rounded">
          <li>OPENAI_API_KEY</li>
          <li>TWILIO_ACCOUNT_SID</li>
          <li>TWILIO_AUTH_TOKEN</li>
          <li>TWILIO_WHATSAPP_NUMBER</li>
        </ul>
      </div>
    </div>
  );
}
