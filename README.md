<p align="center">
    <a href="https://www.ijcai.org/proceedings/2018/0505.pdf"><img src="https://img.shields.io/badge/-Paper-grey?logo=read%20the%20docs&logoColor=green" alt="Paper"></a>
    <a href="https://github.com/VeritasYin/STGCN_IJCAI-18"><img src="https://img.shields.io/badge/-Original%20Repo-grey?logo=github" alt="Github"></a>
    <a href="https://github.com/suryakirank1/traffic-flow-prediction-using-STGCN"><img src="https://img.shields.io/badge/-My%20Fork-blue" alt="My Repo"></a>
    <a href="https://github.com/VeritasYin/STGCN_IJCAI-18/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-BSD%202--Clause-red.svg"></a>
</p>

---

## Introduction

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

a4e47dddd2ab9e97a14173bace3f0ecf

> Large dataset files are **not included** in this repository. You may refer to the original repo or PeMS website to download the data.

---

├── dataset/
├── figures/
├── models/
├── output/
│ └── models/ # Trained models (tracked with Git LFS)
├── utils/
├── main.py
├── README.md
├── LICENSE
└── venv/ # Ignored by .gitignore

```

---

## Acknowledgements

- Original paper: **Bing Yu*, Haoteng Yin*, Zhanxing Zhu**, IJCAI 2018
- Original GitHub repo: [VeritasYin/STGCN_IJCAI-18](https://github.com/VeritasYin/STGCN_IJCAI-18)
- PyTorch Geometric Temporal: [STConv](https://pytorch-geometric-temporal.readthedocs.io/en/latest/modules/root.html#torch_geometric_temporal.nn.attention.stgcn.STConv)

> This repository is intended for **educational and research purposes only**.

---

## License

This repository follows the **BSD 2-Clause License** from the original repo. Please see the `LICENSE` file for details.

```

---

### ✅ How to push this updated README

1. Stage the README:

```bash
git add README.md
```

2. Commit your changes:

```bash
git commit -m "Update README: acknowledge original authors and add usage info"
```

3. Push to GitHub:

```bash
git push origin master
```
