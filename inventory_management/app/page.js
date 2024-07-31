'use client' // makes this a client side app
import Image from "next/image";
import { useState, useEffect } from 'react'
import { firestore } from "@/firebase";
import { Box, Typography } from "@mui/material";

export default function Home() {
  return <Box><Typography variant="h1">Inventory Management</Typography></Box>
}
