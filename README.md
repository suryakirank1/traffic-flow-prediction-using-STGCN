# Traffic Flow Prediction using STGCN

<p align="center">
    <a href="https://www.ijcai.org/proceedings/2018/0505.pdf"><img src="https://img.shields.io/badge/-Paper-grey?logo=read%20the%20docs&logoColor=green" alt="Paper"></a>
    <a href="https://github.com/VeritasYin/STGCN_IJCAI-18"><img src="https://img.shields.io/badge/-Original%20Repo-grey?logo=github" alt="Github"></a>
    <a href="https://github.com/suryakirank1/traffic-flow-prediction-using-STGCN"><img src="https://img.shields.io/badge/-My%20Fork-blue" alt="My Repo"></a>
    <a href="https://github.com/VeritasYin/STGCN_IJCAI-18/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-BSD%202--Clause-red.svg"></a>
</p>

---

## Introduction

This repository contains an **adaptation of Spatio-Temporal Graph Convolutional Networks (STGCN)** for traffic forecasting, originally proposed by **Bing Yu, Haoteng Yin, and Zhanxing Zhu** in their IJCAI 2018 paper:  

[Spatio-temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting](https://www.ijcai.org/proceedings/2018/0505.pdf)

This fork is based on the [original GitHub repo by VeritasYin](https://github.com/VeritasYin/STGCN_IJCAI-18) with local experiments and trained models.

---

## Features

- Predict traffic speed/flow on graph-structured road networks.
- Supports medium and large datasets (PeMSD7-M and PeMSD7-L).
- Includes trained STGCN model (`STGCN-9150`) tracked via Git LFS.
- Implemented in Python 3 using TensorFlow.

---

## Dataset

The dataset used is **[PeMSD7](http://pems.dot.ca.gov/)**, collected from California state highway sensors.  

- `PeMSD7_V_{num_route}.csv` → Historical speed records  
- `PeMSD7_W_{num_route}.csv` → Weighted adjacency matrix  

> Large dataset files are **not included** in this repository. You may refer to the original repo or PeMS website to download the data.

---

## Installation

```bash
# Clone this repository
git clone https://github.com/suryakirank1/traffic-flow-prediction-using-STGCN.git
cd traffic-flow-prediction-using-STGCN

# Create virtual environment
python -m venv venv
source venv/Scripts/activate   # Windows
# or
source venv/bin/activate       # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Install Git LFS to handle large model files
git lfs install
Usage
Training
python main.py --n_route 228 --graph dataset/PeMSD7_W_228.csv

Testing / Evaluation
python main.py --mode test --model output/models/STGCN-9150


Default config: 50 epochs, batch size 50, historical window of 12 steps, predicting next 9 steps.

Output model files are saved in output/models/ and tracked via Git LFS.

Folder Structure
├── data_loader/
├── dataset/
├── figures/
├── models/
├── output/
│   └── models/  # Trained models (tracked with Git LFS)
├── utils/
├── main.py
├── README.md
├── LICENSE
└── venv/        # Ignored by .gitignore

Acknowledgements

Original paper: Bing Yu, Haoteng Yin, Zhanxing Zhu**, IJCAI 2018

Original GitHub repo: VeritasYin/STGCN_IJCAI-18

PyTorch Geometric Temporal: STConv

This repository is intended for educational and research purposes only.

License

This repository follows the BSD 2-Clause License from the original repo. Please see the LICENSE file for details.
