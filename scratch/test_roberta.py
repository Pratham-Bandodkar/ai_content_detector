from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

try:
    print("Loading RoBERTa model...")
    model_path = "models/text/roberta_finetuned"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    
    human_text = "I went to the store today and bought some apples. It was a nice sunny day, and I enjoyed the walk."
    ai_text = "Furthermore, it is important to consider that the intricate tapestry of human experience is multifaceted. In conclusion, we must remember that analysis is key."
    
    inputs_human = tokenizer(human_text, return_tensors="pt")
    inputs_ai = tokenizer(ai_text, return_tensors="pt")
    
    with torch.no_grad():
        outputs_human = model(**inputs_human)
        outputs_ai = model(**inputs_ai)
        
    prob_human = F.softmax(outputs_human.logits, dim=-1).squeeze().numpy()
    prob_ai = F.softmax(outputs_ai.logits, dim=-1).squeeze().numpy()
    
    print("Human text logits:", outputs_human.logits.numpy())
    print("Human text prob:", prob_human)
    print("AI text logits:", outputs_ai.logits.numpy())
    print("AI text prob:", prob_ai)
    print("Model config id2label:", model.config.id2label)
    
except Exception as e:
    import traceback
    traceback.print_exc()
