# Week 08 - Continuous Delivery (CD) to AKS with GitHub Actions

This example demonstrates a robust Continuous Delivery (CD) pipeline using GitHub Actions to deploy your e-commerce microservices and frontend application to an Azure Kubernetes Service (AKS) cluster. Building upon Week 07's Continuous Integration (CI), this setup automates the final step of getting your tested Docker images from Azure Container Registry (ACR) onto your Kubernetes cluster.

## 🚀 Purpose

The primary goals of this example are to illustrate:

- **Automated Deployment:** Deploying containerized applications (backend microservices and frontend) to AKS.
- **Two-Phase CD:** Using separate GitHub Actions workflows for backend and frontend deployment to handle dynamic external IP addresses of LoadBalancer services.
- **Dynamic Configuration:** How to inject dynamically obtained backend service IPs into the frontend's JavaScript configuration during the CD process.
- **GitHub Actions for CD:** Leveraging GitHub's native CI/CD platform for orchestrating deployments.

## 🛠️ Prerequisites

Before you begin, ensure you have the following:

1. Create all required resources (Resource Group, Storage Account, ACR, AKS)
2. **Azure Service Principal:** Create new Service Principal.
3. Add new role for service principal for resource group. **More detailes about this step will be provided in seminar. Make sure you join seminar for this**.
4. **GitHub Repository Secrets:**
   - In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
   - Click **New repository secret** for each:
     - `AZURE_CREDENTIALS`: You need separate SP with Owner permission (As done in step 3).

## 📝 Configuration Files

### 1. Verify Kubernetes Manifests (`hd/k8s/*.yaml`)

- **Images**: All Deployment resources must reference to your ACR with proper image name and tags.

```yaml
image: <YOUR_ACR_NAME>.azurecr.io/<image_name>:<image_tag>
```

### 2. Update Backend Pipeline (`.github/workflows/backend-cd.yml`) & Frontend Pipeline (`.github/workflows/frontend-cd.yml`)

Ensure you replace all placeholders value to actual values.

## new trigger
