import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase-config';

// Ingredient CRUD functions
export const addIngredient = async (ingredientData) => {
  try {
    const docRef = await addDoc(collection(db, 'ingredients'), ingredientData);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getIngredients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'ingredients'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateIngredient = async (id, updatedData) => {
  try {
    const docRef = doc(db, 'ingredients', id);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteIngredient = async (id) => {
  try {
    const docRef = doc(db, 'ingredients', id);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Recipe CRUD functions
export const addRecipe = async (recipeData) => {
  try {
    const docRef = await addDoc(collection(db, 'recipes'), recipeData);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'recipes'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateRecipe = async (id, updatedData) => {
  try {
    const docRef = doc(db, 'recipes', id);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteRecipe = async (id) => {
  try {
    const docRef = doc(db, 'recipes', id);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Cost breakdown CRUD
export const addCostBreakdown = async (costData) => {
  try {
    const docRef = await addDoc(collection(db, 'costBreakdowns'), costData);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCostBreakdowns = async (recipeId) => {
  try {
    const q = query(collection(db, 'costBreakdowns'), where('recipeId', '==', recipeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

// Variant CRUD
export const addVariant = async (variantData) => {
  try {
    const docRef = await addDoc(collection(db, 'variants'), variantData);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getVariantsByRecipe = async (recipeId) => {
  try {
    const q = query(collection(db, 'variants'), where('baseRecipeId', '==', recipeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};
