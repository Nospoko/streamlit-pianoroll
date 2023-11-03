import numpy as np
import streamlit as st

from streamlit_pianoroll import pianoroll

# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/example.py`

st.subheader("Component with Piano Rolls!")


def make_some_notes(first_note: int, step: int):
    notes = []
    for it in range(80):
        start_time = it * 0.25 + 0.1 * np.random.random()
        end_time = start_time + 0.5
        pitch = first_note + 20 * np.sin(2 * np.pi * it / 80) + np.random.choice([-1, 0, 1])
        note = {
            "pitch": int(pitch),
            "startTime": start_time,
            "endTime": end_time,
            "velocity": 60 + np.random.randint(40),
        }
        notes.append(note)

    pianoroll_notes = {
        "totalTime": end_time,
        "notes": notes,
    }
    return pianoroll_notes


for jt in range(3):
    st.markdown(f"### Another one {jt}")
    midi_data = make_some_notes(
        first_note=50 + np.random.randint(20),
        step=np.random.choice([-1, 1]),
    )
    num_clicks = pianoroll(midi_data=midi_data, key=jt)
