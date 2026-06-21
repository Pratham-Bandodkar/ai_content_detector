import torch
from transformers import SwinForImageClassification, SwinConfig
import h5py

try:
    print("Initializing Swin Tiny model...")
    # Load config for Swin Tiny
    config = SwinConfig.from_pretrained("microsoft/swin-tiny-patch4-window7-224")
    config.num_labels = 2
    config.id2label = {0: "new_ai", 1: "new_real"}
    config.label2id = {"new_ai": 0, "new_real": 1}
    
    model = SwinForImageClassification(config)
    state_dict = model.state_dict()
    
    # Load H5 weights
    h5_path = "models/image/best_model.weights.h5"
    print(f"Loading weights from {h5_path}...")
    with h5py.File(h5_path, 'r') as f:
        # We need to find the group containing the datasets
        # In our previous print, we saw they are in 'layers/torch_module_wrapper/vars/'
        # Let's traverse the H5 file and collect all datasets
        h5_weights = {}
        def collect_weights(name, obj):
            if isinstance(obj, h5py.Dataset):
                # The name in H5 looks like 'layers/torch_module_wrapper/vars/classifier.weight'
                # or 'layers/torch_module_wrapper/vars/swin.encoder.layers.0.blocks.0.attention.output.dense.weight'
                # We want to extract the part after 'vars/'
                parts = name.split('/vars/')
                if len(parts) > 1:
                    key = parts[1]
                    h5_weights[key] = torch.tensor(obj[()])
        f.visititems(collect_weights)
        
    print(f"Collected {len(h5_weights)} weights from H5 file.")
    
    # Match and load weights
    loaded_state_dict = {}
    matched_count = 0
    mismatched = []
    
    for key, val in state_dict.items():
        if key in h5_weights:
            h5_val = h5_weights[key]
            # Transpose weights if needed (Keras and PyTorch dense/linear layers have transposed weights)
            if val.shape != h5_val.shape:
                # Let's see if transposing helps
                if len(val.shape) == 2 and val.shape == (h5_val.shape[1], h5_val.shape[0]):
                    h5_val = h5_val.t()
                elif len(val.shape) == 1 and val.shape == h5_val.shape:
                    pass
                else:
                    mismatched.append((key, val.shape, h5_val.shape))
                    continue
            loaded_state_dict[key] = h5_val
            matched_count += 1
        else:
            print(f"Missing in H5: {key}")
            
    print(f"Matched: {matched_count}/{len(state_dict)}")
    if mismatched:
        print(f"Mismatched shapes for {len(mismatched)} layers:")
        for name, p_shape, h_shape in mismatched[:5]:
            print(f"  {name}: PyTorch={p_shape}, H5={h_shape}")
            
    model.load_state_dict(loaded_state_dict, strict=False)
    print("Successfully loaded state dict with strict=False")
    
except Exception as e:
    import traceback
    traceback.print_exc()
