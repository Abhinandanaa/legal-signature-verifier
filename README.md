# legal-signature-verifier (Verilog)

This project implements a secure, clocked RTL module to verify a 32-bit legal signature ID.
Inspired by my SealLaw and LawLens legal tech tools.

## 🧱 Signature Format (32-bit Input)

| Bits    | Field        | Description     |
|---------|--------------|-----------------|
| 31–24   | Region Code  | e.g. Telangana  |
| 23–16   | Auth Level   | e.g. Advocate   |
| 15–8    | Expiry Code  | Simulated Expiry|
| 7–0     | Signature ID | Unique Signature|

## 🔧 Modules

- `pattern_matcher.sv` — Compares decoded fields with authorized values
- `verifier_top.sv` — Extracts fields from input and connects modules
- `testbench.sv` — Tests valid and invalid signatures

## 💻 Simulate it on [EDA Playground](https://edaplayground.com/x/8aqr)


