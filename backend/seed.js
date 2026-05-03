require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const questions = [
  // Linux
  {
    question: "What is the difference between a process and a thread?",
    answer: "A process is an independent program execution with its own memory space. A thread is a subset of a process that shares the same memory space but executes independently. Processes are heavier and safer; threads are lighter and faster for communication.",
    category: "Linux",
    difficulty: "Medium",
    tags: ["os", "fundamentals"]
  },
  {
    question: "How do you check memory usage in Linux?",
    answer: "You can use 'free -m' for a quick summary, 'top' or 'htop' for real-time monitoring, and 'vmstat' for virtual memory statistics.",
    category: "Linux",
    difficulty: "Easy",
    tags: ["monitoring", "cli"]
  },
  {
    question: "What is the purpose of the '/' (root) directory in Linux?",
    answer: "The '/' directory is the top-level directory in the Linux filesystem hierarchy. All other directories and files are children of root, including mounted drives.",
    category: "Linux",
    difficulty: "Easy",
    tags: ["filesystem"]
  },
  
  // Docker
  {
    question: "What is the difference between an Image and a Container?",
    answer: "An Image is a read-only template with instructions for creating a Docker container. A Container is a runnable instance of an image. Think of an image as a Class and a container as an Instance of that class.",
    category: "Docker",
    difficulty: "Easy",
    tags: ["basics"]
  },
  {
    question: "How do you reduce the size of a Docker image?",
    answer: "Use multi-stage builds, choose smaller base images (like Alpine), minimize the number of layers (combine RUN commands), and use .dockerignore to exclude unnecessary files.",
    category: "Docker",
    difficulty: "Medium",
    tags: ["optimization", "best-practices"]
  },
  {
    question: "What is a Dockerfile?",
    answer: "A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image. It automates the image creation process.",
    category: "Docker",
    difficulty: "Easy",
    tags: ["basics"]
  },

  // Kubernetes
  {
    question: "What is a Pod in Kubernetes?",
    answer: "A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster and can contain one or more containers that share network and storage.",
    category: "Kubernetes",
    difficulty: "Easy",
    tags: ["basics"]
  },
  {
    question: "What is the difference between a Deployment and a StatefulSet?",
    answer: "Deployments are used for stateless applications where pods are interchangeable and have random IDs. StatefulSets are for stateful applications (like databases) that require stable network IDs and persistent storage across restarts.",
    category: "Kubernetes",
    difficulty: "Medium",
    tags: ["workloads"]
  },

  // Git
  {
    question: "What is the difference between 'git fetch' and 'git pull'?",
    answer: "'git fetch' only downloads the latest changes from the remote repository but doesn't merge them. 'git pull' does a 'git fetch' followed immediately by a 'git merge' into your current branch.",
    category: "Git",
    difficulty: "Easy",
    tags: ["basics"]
  },
  {
    question: "What is 'git rebase' and when should you use it?",
    answer: "Rebase moves a sequence of commits to a new base commit. It's used to maintain a clean, linear project history by avoiding unnecessary merge commits. Use it on local branches before pushing, but avoid it on shared public branches.",
    category: "Git",
    difficulty: "Medium",
    tags: ["advanced"]
  },

  // CI/CD
  {
    question: "What is Continuous Integration (CI)?",
    answer: "CI is the practice of automating the integration of code changes from multiple contributors into a single software project. It involves frequent commits and automated testing to catch bugs early.",
    category: "CI/CD",
    difficulty: "Easy",
    tags: ["concepts"]
  },
  {
    question: "What is the difference between Continuous Delivery and Continuous Deployment?",
    answer: "Continuous Delivery ensures code is always in a deployable state but requires a manual trigger to push to production. Continuous Deployment automates the entire process, where every change that passes tests is automatically deployed to production.",
    category: "CI/CD",
    difficulty: "Medium",
    tags: ["concepts"]
  },

  // AWS
  {
    question: "What is an S3 bucket?",
    answer: "Amazon S3 (Simple Storage Service) is an object storage service that offers industry-leading scalability, data availability, security, and performance. A bucket is a container for objects stored in S3.",
    category: "AWS",
    difficulty: "Easy",
    tags: ["storage"]
  },
  {
    question: "What is the difference between a Public Subnet and a Private Subnet?",
    answer: "A Public Subnet has a route to an Internet Gateway, allowing resources inside to communicate with the internet directly. A Private Subnet does not have a direct route to the internet and usually uses a NAT Gateway for outbound traffic.",
    category: "AWS",
    difficulty: "Medium",
    tags: ["vpc", "networking"]
  },

  // General / Soft Skills
  {
    question: "Describe a time you encountered a difficult technical problem. How did you solve it?",
    answer: "Focus on your methodology: How you identified the root cause, what tools you used (logs, debuggers), how you researched (docs, StackOverflow), and how you verified the fix.",
    category: "General",
    difficulty: "Medium",
    tags: ["behavioral"]
  },
  {
    question: "What is Infrastructure as Code (IaC)?",
    answer: "IaC is the managing and provisioning of infrastructure through code instead of through manual processes. Tools like Terraform or CloudFormation allow you to version control and automate infrastructure setup.",
    category: "General",
    difficulty: "Easy",
    tags: ["concepts"]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // Clear existing questions to avoid duplicates if re-running
    await Question.deleteMany({});
    console.log('Cleared existing questions.');
    
    await Question.insertMany(questions);
    console.log(`Successfully seeded ${questions.length} questions!`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
