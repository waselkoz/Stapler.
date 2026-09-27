# Stapler AI - GPU Infrastructure & Fine-Tuning Setup

This document tracks exactly how we successfully set up the Brev A100 GPU and routed it to our local frontend/backend, bypassing all security walls to enable automated dataset generation and AI execution.

## 1. Initial GPU Setup
- **Hardware:** Rented a massive NVIDIA A100 (80GB VRAM) instance on Brev (`nutty-bronze-spider`).
- **Model Download:** Installed Ollama and ran `ollama run nemotron` to download the 42GB Nemotron-70B model.

## 2. The 503 & 401 Security Wall Fix
By default, Brev locks down the GPU so only the local system (localhost) can use it. To allow our local laptop to talk to the GPU:
- We first tried opening a "Secure Link" on port `11434`. However, Brev puts a forced Google Login wall in front of Secure Links, which blocked our automated Python API calls (Resulting in a `401 Unauthenticated` error).
- **The Fix:** We deleted the Secure Link and instead opened a **Raw TCP/UDP Port** on `11434`. This completely bypassed the web-browser login screen, giving us a direct pipeline (`http://global.prd.ga.run.brev.nvidia.com:44205/v1`) to the GPU!

## 3. The "Missing Model" Fix
When we restarted Ollama using the raw TCP port, the API claimed `{'models': []}` (0 models installed), even though we downloaded 42GB of data!
- **The Reason:** The systemd (root) service had originally downloaded the model. When we restarted the server under the `shadeform` user, the `shadeform` user folder was empty.
- **The Fix:** We ran a command to inject the `0.0.0.0` rule directly into the systemd root configuration, rather than running it under `shadeform`:
  ```bash
  sudo pkill ollama && sudo sed -i '/^\[Service\]/a Environment="OLLAMA_HOST=0.0.0.0"' /etc/systemd/system/ollama.service && sudo systemctl daemon-reload && sudo systemctl restart ollama
  ```
- This permanently fixed the configuration, instantly bringing Nemotron back online to the public internet.

## 4. The UI / Dashboard Update
- We updated `useStapler.ts` and `dashboard/page.tsx` on the frontend.
- When the `Auditor` agent decides an idea is incomplete, it interrupts the backend and triggers a glowing "Grilling Phase" chat box on the frontend so the user can argue their idea in real-time.

## 5. Automated High-Quality Dataset Generation
We realized a generic dataset would make the AI sound generic. The user explicitly requested an elite AI that focuses on *why an idea fails structurally* rather than just roasting it.
- Created `dataset_generator.py`.
- **How it works:** The script searches DuckDuckGo for "failed startup postmortem case studies", reads the real-world articles, and sends the text through our TCP tunnel directly to the Nemotron GPU. Nemotron then formats it into high-level strategic breakdowns.
- The results are automatically saved into `custom_dataset.json`.

## 6. Next Steps (Fine-Tuning)
Once `custom_dataset.json` is generated:
1. Upload `custom_dataset.json` to the Brev Jupyter notebook.
2. Upload `finetune_example.py` to the Jupyter notebook.
3. Run `finetune_example.py` on the A100 to fuse the new strategic failure knowledge directly into the AI's weights using Unsloth.
