# QCFractalDashboard

Dashboard for the QCFractal Server


## Technology

- QCArchive Fractal Client ver. 0.11.0 (--c conda-forge)
- Python  ver. 3.8.3  (--c conda-forge)
- pip ver. 20.1.1  (--c conda-forge)
- nodejs ver. 14.4.0  (--c conda-forge)
- npm ver. 6.14.5 (--c conda-forge)
- electronjs ver. TBD


## Objective

Use the ElectronJS framework for a GUI with a NodeJS server communicating with a Flask server running a python API. This approach enables a native desktop look & feel to the UI design while providing cross-platform development support using the latest web technologies, deployed as a stand-alone application running on top of a recent release of Python .


## Notes

- I may ditch the use of Plotly Dash in favor of more ubiquitous web technologies to eliminate iFrame constraint inherent in Dash approach.
- Notably could simply use plotlyJS instead (or D3 as well).
