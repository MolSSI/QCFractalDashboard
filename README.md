# MolSSI QCArchive Dashboard 
This application is a results Dashboard for QCArchive projects.


### Install the QCA dashboard

This repository has a Makefile included to help install the QCA dashboard. First, you must create the `conda` environment and install the necessary Javascript packages.

To create the qca dashboard environment and install the necessary packages, make sure you are at the top level of your directory (QCFractalDashboard directory), then type the following command.

~~~bash
$ make environment
~~~


After the script is finished running, activate the seamm dashboard conda environment:

~~~
conda activate qca-dashboard
~~~

If your conda environment is activated, you're ready to start running the dashboard.

## Add QCFractal user and password

Create a private `.env` file in the root directory of the repo (i.e. QCFractalDashboard/), and set 
the username and password to access the QCFractal server in that file:

```
QCFRACTAL_USER=yourUser
QCFRACTAL_PASSWORD=yourPassword
```

## Running the dashboard

You can then run the dashboard after you have installed and activated the dashboard environment. 

### Run a demo dashboard

If you do not have QCA installed, you can view a demo dashboard by using the data in this repository. Use the command

```
./results_dashboard.py
```

Open a browser and navigate to `http://localhost:5000/` to  view the sample dashboard. 

### Running with QCA installed

If you have QCA installed, you can connect to your datastore. In the top level of the repository, type the following command into the terminal:

```
results_dashboard.py
```


