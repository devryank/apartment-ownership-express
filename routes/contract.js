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
        const buildingId = req.body.buildingId;
        const value = await contract.getUnitByBuilding(buildingId);
        res.send({ value: value.toString() });
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
        res.send({ value: value.toString() });
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
        res.send({ value: value.toString() });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

module.exports = router;
