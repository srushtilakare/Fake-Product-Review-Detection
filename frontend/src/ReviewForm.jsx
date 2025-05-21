import React, { useState } from "react";
import { predictReview } from "./api";
import './ReviewForm.css'

function ReviewForm() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult("Predicting...");
    try {
      const res = await predictReview(input);
      setResult(`🟢 Review is ${res.data.prediction.toUpperCase()}`);
    } catch (err) {
      setResult("❌ Error: Could not predict");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-xl bg-white">
      <h2 className="text-xl font-bold mb-4 text-center">Fake Review Detector</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border p-3 rounded-lg mb-4"
          rows="5"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a product review..."
          required
        />
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
          type="submit"
        >
          Predict
        </button>
      </form>
      {result && (
        <div className="mt-4 text-center font-medium text-lg">{result}</div>
      )}
    </div>
  );
}

export default ReviewForm;
