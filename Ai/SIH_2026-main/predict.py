import sys
import argparse
from pathlib import Path

import torch
from torch import nn
from PIL import Image
from torchvision import transforms, models

from pricing import estimate


# ============================================================
# SETTINGS
# ============================================================

MODEL_PATH = Path("model/ewaste_classifier.pt")


# ============================================================
# LOAD MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )


checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu"
)

classes = checkpoint["classes"]

IMG_SIZE = checkpoint.get(
    "img_size",
    224
)


model = models.mobilenet_v3_small(
    weights=None
)

model.classifier[-1] = nn.Linear(
    model.classifier[-1].in_features,
    len(classes)
)

model.load_state_dict(
    checkpoint["state_dict"]
)

model.eval()


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

transform = transforms.Compose([

    transforms.Resize(
        (IMG_SIZE, IMG_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


# ============================================================
# PREDICTION
# ============================================================

def predict_image(
    image_path,
    location,
    weight_kg
):

    # --------------------------------------------------------
    # Open image
    # --------------------------------------------------------

    image = Image.open(
        image_path
    ).convert("RGB")


    image_tensor = transform(
        image
    ).unsqueeze(0)


    # --------------------------------------------------------
    # AI prediction
    # --------------------------------------------------------

    with torch.no_grad():

        output = model(
            image_tensor
        )

        probabilities = torch.softmax(
            output,
            dim=1
        )[0]


    # Get top 3
    top_values, top_indices = torch.topk(
        probabilities,
        min(3, len(classes))
    )


    predicted_index = int(
        top_indices[0]
    )

    category = classes[
        predicted_index
    ]

    confidence = float(
        top_values[0]
    )


    # ========================================================
    # DISPLAY AI RESULT
    # ========================================================

    print("\n")
    print("=" * 50)
    print("           E-WASTE AI RESULT")
    print("=" * 50)

    print(
        f"\nImage: {image_path}"
    )

    print(
        f"\nPrediction: {category}"
    )

    print(
        f"Confidence: {confidence * 100:.2f}%"
    )


    # --------------------------------------------------------
    # TOP 3 PREDICTIONS
    # --------------------------------------------------------

    print("\nTop 3 predictions:")

    for probability, index in zip(
        top_values,
        top_indices
    ):

        print(
            f"{classes[index]:20s}"
            f"{probability.item() * 100:6.2f}%"
        )


    # ========================================================
    # PRICE ESTIMATION
    # ========================================================

    print("\n")
    print("-" * 50)
    print("             PRICE ESTIMATION")
    print("-" * 50)


    print(
        f"Location: {location}"
    )

    print(
        f"Weight:   {weight_kg} kg"
    )


    try:

        pricing_result = estimate(
            category,
            location,
            weight_kg
        )


        # ----------------------------------------------------
        # Check if price exists
        # ----------------------------------------------------

        if (
            pricing_result.get("status")
            == "no_direct_price"
        ):

            print(
                "\nPrice: Not available"
            )

            print(
                pricing_result.get(
                    "message",
                    "No price data found."
                )
            )


        elif (
            pricing_result.get("status")
            == "no_price_data"
        ):

            print(
                "\nPrice: Not available"
            )

            print(
                "No pricing data found."
            )


        else:

            price_per_kg = pricing_result.get(
                "price_per_kg_median"
            )

            estimated_value = pricing_result.get(
                "estimated_value"
            )

            price_range = pricing_result.get(
                "range",
                {}
            )

            minimum = price_range.get(
                "min"
            )

            maximum = price_range.get(
                "max"
            )

            samples = pricing_result.get(
                "samples"
            )


            print(
                f"\nPrice per kg: "
                f"₹{price_per_kg:.2f}"
            )

            print(
                f"Estimated Value: "
                f"₹{estimated_value:.2f}"
            )

            if (
                minimum is not None
                and maximum is not None
            ):

                print(
                    f"Estimated Range: "
                    f"₹{minimum:.2f} - "
                    f"₹{maximum:.2f}"
                )

            print(
                f"Pricing samples: "
                f"{samples}"
            )


    except Exception as error:

        print(
            "\nPrice calculation error:"
        )

        print(error)


    print("-" * 50)


# ============================================================
# COMMAND LINE
# ============================================================

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="E-Waste AI Image Classifier + Price Estimator"
    )


    parser.add_argument(
        "image",
        help="Path to the image"
    )


    parser.add_argument(
        "--location",
        default="Bhopal",
        help="Location for price estimation"
    )


    parser.add_argument(
        "--weight",
        type=float,
        default=1.0,
        help="Weight of e-waste in kg"
    )


    args = parser.parse_args()


    image_path = Path(
        args.image
    )


    if not image_path.exists():

        print(
            f"\nImage not found: {image_path}"
        )

        sys.exit(1)


    if args.weight <= 0:

        print(
            "\nWeight must be greater than 0."
        )

        sys.exit(1)


    predict_image(
        image_path,
        args.location,
        args.weight
    )