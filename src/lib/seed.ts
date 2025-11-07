'use client';

import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  Firestore,
  collection,
  doc,
  writeBatch,
} from 'firebase/firestore';
import {
  mockBrands,
  mockCategories,
  mockOrders,
  mockProducts,
  mockUsers,
} from './mockData';
import { toast } from '@/components/ui/sonner';

async function seedCollection(
  firestore: Firestore,
  collectionName: string,
  data: any[]
) {
  const collectionRef = collection(firestore, collectionName);
  const batch = writeBatch(firestore);
  
  console.log(`Seeding ${collectionName}...`);
  data.forEach((item) => {
    const docRef = doc(firestore, collectionName, item.id);
    batch.set(docRef, item);
  });
  
  await batch.commit();
  console.log(`Seeded ${collectionName} with ${data.length} documents.`);
}


async function seedUsers(firestore: Firestore, auth: Auth) {
  const usersRef = collection(firestore, 'users');
  const batch = writeBatch(firestore);
  console.log("Seeding user documents in Firestore...");

  for (const user of mockUsers) {
      const userRef = doc(usersRef, user.id);
      batch.set(userRef, user);

      try {
          let password;
          switch (user.role) {
            case 'admin':
                password = 'admin123';
                break;
            case 'manager':
                password = 'manager123';
                break;
            case 'user':
            default:
                password = 'user123';
                break;
          }
          
          try {
             await createUserWithEmailAndPassword(auth, user.email, password);
             console.log(`Created auth user for ${user.email}`);
          } catch (e: any) {
              if (e.code === 'auth/email-already-in-use') {
                console.log(`Auth user for ${user.email} already exists.`);
              } else {
                console.warn(`Could not create auth user for ${user.email}:`, e.message);
              }
          }
      } catch (error: any) {
          console.error(`Failed to seed user ${user.email}:`, error.message);
      }
  }

  await batch.commit();
  console.log("User document seeding complete.");
}


async function seedOrders(firestore: Firestore) {
  await seedCollection(firestore, 'orders', mockOrders);
}

export async function seedDatabase(firestore: Firestore, auth: Auth) {
  try {
    toast({title: "Заполнение базы данных...", description: "Это может занять некоторое время."});
    
    await seedUsers(firestore, auth);
    await seedCollection(firestore, 'categories', mockCategories);
    await seedCollection(firestore, 'brands', mockBrands);
    await seedCollection(firestore, 'products', mockProducts);
    await seedOrders(firestore);

    toast({title: "База данных успешно заполнена!"});
    console.log('Database seeding completed successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('Error seeding database:', error.message);
    toast({title: "Ошибка при заполнении базы данных", description: error.message, variant: "destructive"});
    throw new Error(`Database seeding failed: ${error.message}`);
  }
}
