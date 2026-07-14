import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  TOP_K: 3,
};

// ===============================
// Pinecone Connection
// ===============================
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const { host } = await pc.describeIndex(process.env.PINECONE_INDEX);

const index = pc.index({ host });

// ===============================
// Student Data (8 values)
// ===============================
const students = [
  {
    id: "1",
    values: [90, 85, 88, 92, 95, 90, 80, 94],
    metadata: {
      name: "Alice",
      department: "CSE",
    },
  },
  {
    id: "2",
    values: [45, 50, 48, 55, 60, 70, 85, 65],
    metadata: {
      name: "Bob",
      department: "ECE",
    },
  },
  {
    id: "3",
    values: [88, 84, 90, 91, 93, 88, 82, 95],
    metadata: {
      name: "Charlie",
      department: "IT",
    },
  },
];

// ===============================
// Insert
// ===============================
async function insertData() {
  await index.upsert({ records: students });

  console.log("✅ Data Inserted");
}

// ===============================
// Search Similar Students
// ===============================
async function searchStudent() {

  // Student with high marks
  const queryVector = [89, 85, 87, 91, 94, 89, 81, 93];

  const result = await index.query({
    vector: queryVector,
    topK: CONFIG.TOP_K,
    includeMetadata: true,
  });

  console.log("\n===== Similar Students =====\n");

  result.matches.forEach((student, i) => {
    console.log(`Rank ${i + 1}`);
    console.log("Name :", student.metadata.name);
    console.log("Department :", student.metadata.department);
    console.log("Similarity :", student.score);
    console.log("-------------------------");
  });
}

// ===============================
// Fetch
// ===============================
async function fetchStudent(id) {

  const result = await index.fetch({ ids: [id] });

  console.log(result.records);
}

// ===============================
// Update
// ===============================
async function updateStudent() {

  await index.upsert({
    records: [
      {
        id: "2",
        values: [95, 96, 95, 96, 94, 95, 92, 96],
        metadata: {
          name: "Bob",
          department: "ECE"
        }
      }
    ]
  });

  console.log("Student Updated");
}

// ===============================
// Delete
// ===============================
async function deleteStudent(id) {

  await index.deleteMany({ ids: [id] });

  console.log("Student Deleted");
}

// ===============================
// Main
// ===============================
async function main() {

  console.log("Insert Data");
  await insertData();

  console.log("\nSearch");
  await searchStudent();

  console.log("\nFetch Student");
  await fetchStudent("1");

  console.log("\nUpdate Student");
  await updateStudent();

  console.log("\nDelete Student");
  await deleteStudent("3");

}

main();