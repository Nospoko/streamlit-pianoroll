import numpy as np
import streamlit as st

from streamlit_pianoroll import pianoroll

# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/example.py`

st.subheader("Component with Piano Rolls!")


def make_some_notes(first_note: int, step: int):
    notes = []
    for it in range(20):
        end_time = it * 0.25 + 0.1
        note = {
            "pitch": int(first_note + it * step),
            "startTime": it * 0.25,
            "endTime": end_time,
            "velocity": 60 + 3 * it,
        }
        notes.append(note)

    pianoroll_notes = {
        "totalTime": end_time,
        "notes": notes,
    }
    return pianoroll_notes


for jt in range(3):
    st.markdown(f"### Another one {jt}")
    note_sequence = make_some_notes(
        first_note=50 + np.random.randint(20),
        step=np.random.choice([-1, 1]),
    )
    num_clicks = pianoroll(note_sequence=note_sequence, key=jt)

st.markdown("You've clicked %s times!" % int(num_clicks))
