const express = require('express');
const { contract } = require('../contract');
const { wallet, provider } = require('../blockchain');
const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.get('/balance', async (req, res) => {
    try {
        const balance = await provider.getBalance(wallet.address);
        res.send({
            address: wallet.address,
            balance: ethers.formatEther(balance) + ' ETH'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching balance');
    }
});

// Read data from contract
router.get('/getAllBuilding', async (req, res) => {
    try {
        const value = await contract.getAllBuilding();
        res.send({ value: value.toString() });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading value from contract');
    }
});

// Write to contract
router.post('/createBuilding', async (req, res) => {
    try {
        const { name, location } = req.body;
        const id = uuidv4();
        const tx = await contract.createBuilding(id, name, location);
        await tx.wait();
        res.send({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.get('/getUnitByBuilding', async (req, res) => {
    try {
        const buildingId = req.body.buildingId; // For GET, it's better to use `req.query` instead
        const rawUnits = await contract.getUnitByBuilding(buildingId);

        const units = rawUnits.map(u => ({
            id: u[0],
            owner: u[1],
            floor: Number(u[2]), // or u[2].toString()
            unitNumber: u[3],
            unitStatus: Number(u[4]),
            saleStatus: Number(u[5]),
            createdBy: u[6],
            createdAt: Number(u[7]) // convert BigInt timestamp
        }));

        res.send({ units });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

router.post('/createUnit', async (req, res) => {
    try {
        const { owner, floor, unitNumber, buildingId } = req.body;
        const id = uuidv4();

        const tx = await contract.createUnit(id, owner, floor, unitNumber, buildingId);
        res.send({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

router.post('/createUnitForSale', async (req, res) => {
    try {
        const { buildingId, unitId, price } = req.body;

        const tx = await contract.createUnitForSale(buildingId, unitId, price);
        await tx.wait();
        res.send({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

router.post('/requestBuy', async (req, res) => {
    try {
        const { buildingId, unitId } = req.body;
        const id = uuidv4();

        const tx = await contract.requestBuy(id, buildingId, unitId);
        await tx.wait();
        res.send({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

router.get('/getBuyRequest', async (req, res) => {
    try {
        const { buildingId, unitId, owner } = req.body;
        const rawRequests = await contract.getBuyRequest(buildingId, unitId, owner);

        const requests = rawRequests.map(r => ({
            id: r[0],
            unitId: r[1],
            requestedBy: r[2],
            status: Number(r[3]),
            createdAt: Number(r[4])
        }));

        res.send({ requests });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

router.post('/approveRequest', async (req, res) => {
    try {
        const { id, buildingId, unitId } = req.body;
        const tx = await contract.approveRequest(id, buildingId, unitId);
        await tx.wait();
        res.send({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

router.post('/rejectRequest', async (req, res) => {
    try {
        const { id, buildingId, unitId } = req.body;
        const tx = await contract.rejectRequest(id, buildingId, unitId);
        await tx.wait();
        res.send({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.post('/transferUnitOwnership', async (req, res) => {
    try {
        const { buildingId, unitId, price, sender } = req.body;
        const tx = await contract.transferUnitOwnership(buildingId, unitId, {
            value: ethers.parseEther(price),
            sender: sender,
        });
        await tx.wait();
        res.send({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

module.exports = router;
