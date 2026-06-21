import torch

# ---------- LOAD PRETRAINED GPT-2 (GLTR BASE MODEL) ----------
# Lazy-loaded, forced to CPU only to avoid paging file exhaustion in Windows subprocesses.
# Both RoBERTa and GPT-2 loading on GPU simultaneously causes hard crashes (exit 3221225477).
_tokenizer = None
_model = None
_gpt2_failed = False  # Sentinel: if GPT-2 ever fails to load, skip retrying

def _get_gpt2():
    global _tokenizer, _model, _gpt2_failed
    if _gpt2_failed:
        return None, None
    if _tokenizer is None or _model is None:
        try:
            from transformers import GPT2LMHeadModel, GPT2Tokenizer
            _tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
            # Force CPU to prevent paging file overrun when RoBERTa is also in memory
            _model = GPT2LMHeadModel.from_pretrained("gpt2").to(torch.device("cpu"))
            _model.eval()
        except Exception:
            _gpt2_failed = True
            return None, None
    return _tokenizer, _model


# ---------- GLTR TOKEN RANK STATISTICS ----------
def get_gltr_token_stats(text):
    """
    Computes GLTR-style token predictability statistics.
    Returns uniform fallback stats if GPT-2 is unavailable.
    """
    tokenizer, model = _get_gpt2()
    if tokenizer is None or model is None:
        # GPT-2 unavailable — return uniform fallback (each bucket gets 25%)
        return {"top_10": 1, "top_100": 1, "top_1000": 1, "outside": 1}

    encodings = tokenizer(text, return_tensors="pt")
    input_ids = encodings.input_ids

    # Limit size to prevent performance bottleneck on very long inputs
    if input_ids.size(1) > 1024:
        input_ids = input_ids[:, :1024]

    # Run on CPU explicitly to match model device
    input_ids = input_ids.to(torch.device("cpu"))

    with torch.no_grad():
        outputs = model(input_ids)
        logits = outputs.logits

    top_10 = 0
    top_100 = 0
    top_1000 = 0
    outside = 0

    for i in range(1, input_ids.size(1)):
        token_id = input_ids[0, i]
        token_logits = logits[0, i - 1]

        # Rank tokens by probability
        sorted_indices = torch.argsort(token_logits, descending=True)
        rank = (sorted_indices == token_id).nonzero(as_tuple=True)[0].item()

        if rank < 10:
            top_10 += 1
        elif rank < 100:
            top_100 += 1
        elif rank < 1000:
            top_1000 += 1
        else:
            outside += 1

    return {
        "top_10": top_10,
        "top_100": top_100,
        "top_1000": top_1000,
        "outside": outside
    }


# ---------- NORMALIZE GLTR FEATURES ----------
def normalize_gltr_stats(stats):
    """
    Converts raw GLTR counts into ratios (length-independent).
    """
    total = sum(stats.values())
    if total == 0:
        return {
            "top_10_ratio": 0,
            "top_100_ratio": 0,
            "top_1000_ratio": 0,
            "outside_ratio": 0
        }

    return {
        "top_10_ratio": stats["top_10"] / total,
        "top_100_ratio": stats["top_100"] / total,
        "top_1000_ratio": stats["top_1000"] / total,
        "outside_ratio": stats["outside"] / total
    }
