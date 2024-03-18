import json
import fortepyan as ff
import streamlit as st
from datasets import load_dataset, Dataset
from streamlit_pianoroll import from_fortepyan


st.subheader("Maestro Piano Rolls!")


def main():
    dataset = get_dataset()

    idx = st.number_input(
        label="record id",
        min_value=0,
        max_value=len(dataset) - 1,
        value=9,
    )
    piece = ff.MidiPiece.from_huggingface(dataset[idx])
    from_fortepyan(piece)

    source = json.loads(dataset[idx]["source"])
    st.write(source)


@st.cache_data
def get_dataset() -> Dataset:
    dataset_name = "roszcz/maestro-sustain-v2"
    dataset = load_dataset(dataset_name, split="train")

    return dataset


if __name__ == "__main__":
    main()
