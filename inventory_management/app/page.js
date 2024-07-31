"use client"; // makes this a client side app
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Stack, TextField, Typography, Button } from "@mui/material";
import { collection, getDocs, query, deleteDoc, doc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]); // state variable to store inventory
  const [open, setOpen] = useState(false); // add and remove items modal
  const [itemName, setItemName] = useState(""); // items name, used to store the items

  const updateInventory = async () => {
    // fetch inventory from firebase, "updating from firebase" make async so it wont block code when fetch whitch would cause wesite to freeze
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    // console.log(inventoryList)
  };

  const addItem = async () => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }); // if exists then add 1
    } else {
      // else if dosent set to 1
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory(); // update inventory
  };

  const removeItem = async () => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        //if = 1 then delete
        await deleteDoc(docRef);
      } else {
        // else set docRef to quantity to quantity - 1
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory(); // update inventory
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
            }}
            />
            <Button
            variant="outlined" onClick={() => {
              addItem(itemName)
              setItemName('') // retting input
              handleClose()
            }}> ADD
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Typography variant="h1">Inventory Management</Typography>
    </Box>
  );
}
