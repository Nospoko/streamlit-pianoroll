import numpy as np
import pandas as pd
import streamlit as st
from fortepyan import MidiPiece

from streamlit_pianoroll import from_notes_df, from_fortepyan

# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/example.py`


def main():
    st.title("Behold, Piano Rolls!")

    notes_primary = make_some_notes(first_note=60)
    notes_secondary = make_some_notes(first_note=53)

    piece = MidiPiece(df=pd.DataFrame(notes_primary))
    secondary_piece = MidiPiece(df=pd.DataFrame(notes_secondary))

    st.subheader("Piece A default font")
    from_fortepyan(
        key="a",
        piece=piece,
    )

    st.subheader("Piece A custom font")
    sound_font_url = "https://soundfonts.ams3.digitaloceanspaces.com/touhou"
    st.write(sound_font_url)

    from_fortepyan(
        key="b",
        piece=piece,
        sound_font_url=sound_font_url,
    )

    st.subheader("Piece A & B")
    from_fortepyan(
        piece=piece,
        secondary_piece=secondary_piece,
    )

    st.subheader("Piece B `from_notes_df`")
    from_notes_df(
        notes_df=secondary_piece.df,
    )


def make_some_notes(first_note: int) -> list[dict]:
    start_key = "start"
    end_key = "end"

    notes = []
    for it in range(180):
        start_time = it * 0.25 + 0.1 * np.random.random()
        end_time = start_time + 0.5
        pitch = first_note + 20 * np.sin(2 * np.pi * it / 80) + np.random.choice([-1, 0, 1])
        note = {
            "pitch": int(pitch),
            start_key: start_time,
            end_key: end_time,
            "velocity": 20 + np.random.randint(100),
        }
        notes.append(note)

    return notes


if __name__ == "__main__":
    main()
