"use client"; // makes this a client-side app
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Modal,
  Stack,
  TextField,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]); // state variable to store inventory
  const [open, setOpen] = useState(false); // add and remove items modal
  const [nameModalOpen, setNameModalOpen] = useState(false); // modal for changing notepad name
  const [itemName, setItemName] = useState(""); // items name, used to store the items
  const [notepadName, setNotepadName] = useState("Grocery List"); // notepad name
  const [newNotepadName, setNewNotepadName] = useState(""); // new notepad name
  const [searchTerm, setSearchTerm] = useState(""); // search term

  const updateInventory = async () => {
    // fetch inventory from firebase, "updating from firebase" make async so it wont block code when fetch which would cause website to freeze
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
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }); // if exists then add 1
    } else {
      await setDoc(docRef, { quantity: 1 }); // if doesn't exist, set to 1
    }

    await updateInventory(); // update inventory
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef); // if quantity is 1, delete
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }); // else decrement quantity
      }
    }

    await updateInventory(); // update inventory
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleNameModalOpen = () => setNameModalOpen(true);
  const handleNameModalClose = () => setNameModalOpen(false);

  const handleChangeNotepadName = () => {
    setNotepadName(newNotepadName);
    setNewNotepadName("");
    handleNameModalClose();
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      bgcolor="#f5f5f5"
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="1px solid #ccc"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName(""); // resetting input
                handleClose();
              }}
            >
              ADD
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={nameModalOpen} onClose={handleNameModalClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="1px solid #ccc"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Change Notepad Name</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={newNotepadName}
              onChange={(e) => {
                setNewNotepadName(e.target.value);
              }}
            />
            <Button variant="contained" onClick={handleChangeNotepadName}>
              Change
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ mb: 2, bgcolor: "#1976d2", color: "white" }}
      >
        Add new item
      </Button>

      <Button
        variant="contained"
        onClick={handleNameModalOpen}
        sx={{ mb: 2, bgcolor: "#1976d2", color: "white" }}
      >
        Change Notepad Name
      </Button>

      <TextField
        variant="outlined"
        fullWidth
        placeholder="Search items"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2, width: "80%", maxWidth: 800 }}
      />

      <Paper elevation={3} sx={{ p: 2, width: "80%", maxWidth: 800 }}>
        <Box
          bgcolor="#fffacd"
          padding={2}
          borderRadius="4px 4px 0 0"
          borderBottom="1px solid #ccc"
        >
          <Typography variant="h4" color="#333" textAlign="center">
            {notepadName}
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ maxHeight: 400, overflowY: "auto", p: 2 }}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f8f8f8"
              padding={2}
              border="1px solid #ccc"
              borderRadius={1}
            >
              <Typography variant="h6" color="#222">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6" color="#222">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}


