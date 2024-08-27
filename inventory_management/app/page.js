"use client"; // makes this a client-side app
import { useState, useEffect } from "react";
import { firestore, auth } from "@/firebase";
import { GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import {
  Box,
  Modal,
  Stack,
  TextField,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  where,
} from "firebase/firestore";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import Auth from "./Login";

export default function Home() {
  const [inventory, setInventory] = useState([]); // state variable to store inventory
  const [open, setOpen] = useState(false); // add and remove items modal
  const [itemName, setItemName] = useState(""); // items name, used to store the items
  const [notepadName, setNotepadName] = useState("Grocery List"); // notepad name
  const [searchTerm, setSearchTerm] = useState(""); // search term
  const [editOpen, setEditOpen] = useState(false); // edit notepad name modal
  const [user, setUser] = useState(null); // store logged-in user

  // Initialize the Google provider
  const provider = new GoogleAuthProvider();

  // console.log("Firestore instance:", firestore);

  // Fetch inventory from Firebase
  const updateInventory = async () => {
    // console.log("Updating inventory");
    const user = auth.currentUser;
    // console.log("Current user:", user);
    if (!user) {
      // console.log("No user logged in");
      return;
    }

    try {
      const q = query(
        collection(firestore, "inventory"),
        where("userId", "==", user.uid)
      );
      // console.log("Query:", q);
      const querySnapshot = await getDocs(q);
      // console.log("Number of documents:", querySnapshot.size);
      const inventoryList = [];
      querySnapshot.forEach((doc) => {
        // console.log("Document data:", doc.data());
        inventoryList.push({
          name: doc.id.replace("_" + user.uid, ""),
          ...doc.data(),
        });
      });
      // console.log("Inventory list:", inventoryList);
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error in updateInventory:", error);
    }
  };

  // Handle item addition
  const addItem = async (item) => {
    //console.log("Adding item:", item);
    const user = auth.currentUser;
    // console.log("USER:", user);
    if (!user) {
      console.log("No user logged in");
      return;
    }

    // console.log("Current user:", user.uid);
    // console.log("Original item:", item);
    // console.log("Starting Firestore operation...");

    const docRef = doc(
      collection(firestore, "inventory"),
      item + "_" + user.uid
    );

    //console.log(docRef)

    try {
      const docSnap = await getDoc(docRef);
      //console.log("User UID:", user.uid);
      const newData = {
        quantity: docSnap.exists() ? docSnap.data().quantity + 1 : 1,
        userId: user.uid,
      };

      //console.log("Attempting to write:", newData);
      //console.log("Document path:", docRef.path);

      await setDoc(docRef, newData, { merge: true });
      //console.log("Item added successfully");
    } catch (error) {
      console.error("Error in addItem:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user logged in");
      return;
    }

    const docRef = doc(
      collection(firestore, "inventory"),
      item + "_" + user.uid
    );

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentQuantity = docSnap.data().quantity;
        if (currentQuantity > 1) {
          // Update the document to decrease quantity
          const newData = {
            quantity: currentQuantity - 1,
            userId: user.uid,
          };
          await setDoc(docRef, newData, { merge: true });
        } else {
          // Delete the document if quantity is 1 or less
          await deleteDoc(docRef);
        }

        // Update local state
        setInventory((prevInventory) =>
          prevInventory
            .map((invItem) =>
              invItem.name === item
                ? { ...invItem, quantity: Math.max(0, invItem.quantity - 1) }
                : invItem
            )
            .filter((invItem) => invItem.quantity > 0)
        );
      } else {
        console.log("Document does not exist, nothing to remove");
      }
    } catch (error) {
      console.error("Error in removeItem:", error);
    }
  };

  // Monitor auth state and update user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updateInventory(); // Fetch inventory after login
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe(); // Clean up the subscription
  }, []);

  // Modals for adding/editing items
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render login if no user is logged in
  if (!user) {
    return <Auth />;
  }

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Render inventory tracker if user is logged in
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
      padding={2}
    >
      <button onClick={handleLogout}>Logout</button>
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

      <Modal open={editOpen} onClose={handleEditClose}>
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
          <Typography variant="h6">Edit Notepad Name</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={notepadName}
              onChange={(e) => {
                setNotepadName(e.target.value);
              }}
            />
            <Button variant="contained" onClick={handleEditClose}>
              Save
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

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="80%"
        maxWidth={800}
        mb={2}
      >
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search items"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon position="start" />,
          }}
          sx={{ bgcolor: "white" }}
        />
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          width: "80%",
          maxWidth: 800,
          border: "1px solid #ccc",
          borderRadius: 3,
          bgcolor: "#fff",
        }}
      >
        <Box
          bgcolor="#fffacd"
          padding={2}
          borderRadius="4px 4px 0 0"
          borderBottom="1px solid #ccc"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h4" color="#333" textAlign="center">
            {notepadName}
          </Typography>
          <IconButton onClick={handleEditOpen} sx={{ ml: 1 }}>
            <EditIcon />
          </IconButton>
        </Box>

        <Divider />

        <Stack spacing={2} sx={{ maxHeight: 400, overflowY: "auto", p: 2 }}>
          {filteredInventory.length ? (
            filteredInventory.map(({ name, quantity }) => (
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
            ))
          ) : (
            <Typography variant="body1" color="#999" textAlign="center">
              No items found.
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
