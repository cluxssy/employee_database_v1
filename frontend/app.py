import streamlit as st

st.set_page_config(
    page_title="EwandzDigital HRMS",
    page_icon="frontend/assets/icon.jpeg",
    layout="wide",
)

st.logo("frontend/assets/logo.png")

st.title("Welcome to Ewandz Digital HRMS")

st.markdown("""
### Please select a page from the sidebar

* **Dashboard**: View company metrics and charts.
* **Employee List**: Search and filter employee records.
""")
