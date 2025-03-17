
# Travel Insurance Application

A comprehensive travel insurance application built with React, TypeScript, Supabase, and Azure Functions.

## Features

- Browse insurance plans
- Get personalized quotes
- Purchase insurance policies
- Manage user profiles
- Upload travel documents
- Process payments
- View policy details

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query
- React Router
- Supabase Client

### Backend
- Supabase (PostgreSQL, Auth, Storage)
- Azure Functions (Java)
- Azure MySQL Database

## Local Development

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Java 11
- Maven
- Supabase CLI
- Azure Functions Core Tools

### Environment Setup

1. Clone the repository
2. Create a `.env.local` file in the project root with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:7071/api
   ```

### Frontend Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

### Supabase Setup

1. Start a local Supabase instance
   ```bash
   supabase start
   ```

2. Apply the database migration
   ```bash
   supabase db reset
   ```

### Azure Functions Setup

1. Navigate to the Azure Functions directory
   ```bash
   cd src/azure-functions/travelInsuranceApi
   ```

2. Build the project
   ```bash
   mvn clean package
   ```

3. Start the Functions runtime locally
   ```bash
   mvn azure-functions:run
   ```

4. Set up local environment variables for the Functions
   ```
   MYSQL_CONNECTION_STRING=jdbc:mysql://localhost:3306/insurancedb
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   ```

## Testing

### End-to-End Testing
```bash
npm run test:e2e
```

### Unit Testing
```bash
npm run test
```

## Deployment

See [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Project Structure

```
├── public/                  # Static assets
├── src/
│   ├── azure-functions/     # Java Azure Functions
│   ├── components/
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components
│   ├── db/                  # Database migrations
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── .env.local               # Local environment variables
└── AZURE_DEPLOYMENT_GUIDE.md # Deployment guide
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
