# SMS-text-compression
This project compresses SMS text using a three-stage pipeline: lossy abbreviation and vowel removal, Burrows-Wheeler Transform for rearranging text, and Modified Run-Length Encoding for final compression. It reduces message size for low-bandwidth systems like SMS, IoT, and emergency communication.


# Overview
This project implements a hybrid SMS text compression system combining lossy preprocessing (abbreviations and vowel reduction) with lossless algorithms (Burrows-Wheeler Transform and Modified Run-Length Encoding). The primary goal is to allow efficient SMS transmission by maximizing compression ratios while retaining understandable, near-original text.

# Features
Lossy SMS Preprocessing: Standard SMS abbreviations, number substitutions, and vowel removal to reduce message length while preserving overall meaning.

Lossless Pipeline: Burrows-Wheeler Transform (BWT) arranges text for better compressibility; Modified Run-Length Encoding (RLE) encodes repetitious patterns using only alphabetic symbols.

Decompression Verification: Ensures the decompressed output exactly matches the lossy input.

Web Interface: User-friendly interface for entering text, applying compression, and visualizing each stage with charts and statistics.

Ready for Demonstration: Code and assets are organized for faculty or internship presentation, with clarity and educational value.

# Usage
Extract the project ZIP or clone the repository.

Open index.html in any modern browser.

Enter any message in the input box.

Click Compress to view each processing stage, statistics, and charts.

Click Decompress to verify reversibility of the lossless stages.

Use sample messages, or create your own to test different compression outcomes.

# Technical Details
Lossy Stage: Irreversible; original text cannot be fully recovered after this step.

Lossless Stages (BWT + RLE): Fully reversible; output can be decompressed to the lossy result.

No $ Marker in BWT, unless legacy mode is enabled.

All major components and pipelines coded in plain JavaScript for transparency.

# Limitations
Original text cannot be fully reconstructed if lossy rules are applied.

Designed for English-language SMS; custom abbreviation sets would be needed for other languages.

Not optimal for non-text or highly random/unique data.

# Files Included
index.html — Web interface

styles.css — Styling and layout

compressor.js — Compression logic (lossy, BWT, and RLE)

app.js — Application logic and UI control
