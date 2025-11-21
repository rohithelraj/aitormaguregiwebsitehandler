# AWS S3 Setup Guide

This guide will help you create a dedicated IAM user with minimal permissions for the Content Manager app.

## Step 1: Create IAM User

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **IAM** (Identity and Access Management)
3. Click **Users** in the left sidebar
4. Click **Create user** button
5. Enter user name: `aitor-content-manager-app`
6. Click **Next**

## Step 2: Set Permissions

### Option A: Attach Policy Directly (Recommended)

1. Select **Attach policies directly**
2. Click **Create policy** (opens in new tab)
3. Click the **JSON** tab
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3UploadAndDelete",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::aitormaguregiportfolioresources/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::aitormaguregiportfolioresources"
    },
    {
      "Sid": "AllowWebsiteDeployment",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::aitormaguregiportfolio/*"
    },
    {
      "Sid": "AllowWebsiteBucketOperations",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::aitormaguregiportfolio"
    }
  ]
}
```

5. Click **Next**
6. Enter policy name: `AitorContentManagerS3Access`
7. Enter description: `Allows upload and delete operations for Aitor portfolio S3 buckets`
8. Click **Create policy**
9. Go back to the user creation tab
10. Click refresh button on the policies list
11. Search for `AitorContentManagerS3Access`
12. Check the box next to it
13. Click **Next**

## Step 2.5: Configure S3 Bucket Policies for Public Access

Both buckets need bucket policies to allow public read access. ACLs are not used by this app.

### For Content Bucket (aitormaguregiportfolioresources):

1. Go to S3 Console → `aitormaguregiportfolioresources`
2. Click **Permissions** tab
3. Scroll to **Block public access** → Click **Edit**
4. Uncheck **"Block all public access"** → Save changes
5. Scroll to **Bucket policy** → Click **Edit**
6. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
     {
        "Sid": "AllowS3UploadAndDelete",
        "Effect": "Allow",
        "Action": [
           "s3:PutObject",
           "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::aitormaguregiportfolioresources/*"
     },
     {
        "Sid": "AllowListBucket",
        "Effect": "Allow",
        "Action": [
           "s3:ListBucket"
        ],
        "Resource": "arn:aws:s3:::aitormaguregiportfolioresources"
     }
  ]
}
```

7. Click **Save changes**

### For Website Bucket (aitormaguregiportfolio):

1. Go to S3 Console → `aitormaguregiportfolio`
2. Click **Permissions** tab
3. Scroll to **Block public access** → Click **Edit**
4. Uncheck **"Block all public access"** → Save changes
5. Scroll to **Bucket policy** → Click **Edit**
6. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
     {
        "Sid": "AllowWebsiteDeployment",
        "Effect": "Allow",
        "Action": [
           "s3:PutObject",
           "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::aitormaguregiportfolio/*"
     },
     {
        "Sid": "AllowWebsiteBucketOperations",
        "Effect": "Allow",
        "Action": [
           "s3:ListBucket",
           "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::aitormaguregiportfolio"
     }
  ]
}
```

7. Click **Save changes**

### Option B: Use AWS Managed Policy (Less Secure)

If you want full S3 access to this bucket only:

1. Select **Attach policies directly**
2. Search for `AmazonS3FullAccess` (NOT recommended - too broad)
3. Better: Create custom policy as shown in Option A

## Step 3: Review and Create

1. Review the user details
2. Click **Create user**

## Step 4: Create Access Keys

1. Click on the newly created user name `aitor-content-manager-app`
2. Go to **Security credentials** tab
3. Scroll down to **Access keys** section
4. Click **Create access key**
5. Select use case: **Application running outside AWS**
6. Click **Next**
7. (Optional) Add description: `Aitor Content Manager Desktop App`
8. Click **Create access key**
9. **IMPORTANT**: Copy both values:
   - **Access key ID** (starts with `AKIA...`)
   - **Secret access key** (shown only once!)
10. Click **Download .csv file** as backup
11. Click **Done**

## Step 5: Configure the App

1. Open `s3-config.json` in your project
2. Add your credentials:

```json
{
  "region": "us-east-1",
  "bucket": "aitormaguregiportfolioresources",
  "accessKeyId": "AKIA...",
  "secretAccessKey": "your-secret-access-key-here"
}
```

3. Save the file

## Step 6: Test the Connection

1. Start the app: `npm start`
2. Open any JSON file with an image field
3. Click **"Upload New Image"**
4. Select a test image
5. If configured correctly, it should upload successfully

## Security Best Practices

### ✅ DO:
- Use dedicated IAM user for this app only
- Grant minimal permissions (only PutObject and PutObjectAcl)
- Keep `s3-config.json` local and never commit it to git
- Rotate access keys periodically (every 90 days)
- Delete unused access keys

### ❌ DON'T:
- Use your root AWS account credentials
- Share access keys via email or chat
- Commit credentials to version control
- Grant broader permissions than needed
- Use the same credentials for multiple apps

## Troubleshooting

### Error: "Access Denied"
- Check that the IAM policy resource ARN matches your bucket name
- Verify the region is correct (`us-east-1`)
- Ensure both buckets have bucket policies allowing public read access (see Step 2.5)

### Error: "AccessControlListNotSupported"
- This means the bucket has ACLs disabled (which is correct)
- Make sure you're using the updated IAM policy that doesn't include `s3:PutObjectAcl`
- Ensure bucket policies are configured instead (see Step 2.5)

### Error: "S3 not configured"
- Verify `s3-config.json` exists in project root
- Check that `accessKeyId` and `secretAccessKey` are filled in
- Restart the app after updating config

### Error: "Invalid access key"
- Double-check the access key ID (should start with `AKIA`)
- Verify the secret access key was copied correctly
- Ensure no extra spaces or newlines in the config file

## Rotating Access Keys

When you need to rotate keys:

1. Go to IAM → Users → `aitor-content-manager-app`
2. Security credentials → Create access key
3. Update `s3-config.json` with new keys
4. Test the app works with new keys
5. Delete the old access key

## Deleting Access Keys

If you need to revoke access:

1. Go to IAM → Users → `aitor-content-manager-app`
2. Security credentials → Access keys
3. Find the key to delete
4. Click **Actions** → **Delete**
5. Confirm deletion

---

## Website Deployment (Publish to Internet)

The app now supports deploying the built website to a separate S3 bucket. This requires additional permissions for the `aitormaguregiportfolio` bucket.

### How it works:

1. Click **Publish** to build the website from your content (creates files in `dist/website`)
2. After successful build, the **Publish to Internet** button becomes enabled
3. Click **Publish to Internet** to deploy to S3:
   - Deletes all existing files in the bucket
   - Uploads all new website files
   - Sets public-read ACL on all files

### Required Permissions:

The IAM policy shown above includes these additional statements for website deployment:

- **Statement 3** (`AllowWebsiteDeployment`): Upload and delete permissions for website files
- **Statement 4** (`AllowWebsiteBucketOperations`): List bucket contents for bulk deletion

### S3 Bucket Configuration:

Your `aitormaguregiportfolio` bucket should be configured for static website hosting:

1. Go to S3 → `aitormaguregiportfolio` → Properties
2. Scroll to **Static website hosting**
3. Enable static website hosting
4. Set **Index document** to `index.html`
5. Note the bucket website endpoint

### Security Note:

The website deployment requires `DeleteObject` permission to clear the bucket before each deployment. This is a destructive operation - make sure you have backups if needed.

## Quick Reference

**Content Bucket**: `aitormaguregiportfolioresources`
**Website Bucket**: `aitormaguregiportfolio`
**Region**: `us-east-1`

**Required Permissions (Content Bucket)**:
- `s3:PutObject` - Upload files
- `s3:ListBucket` - List bucket contents
- `s3:DeleteObject` - Delete old images

**Required Permissions (Website Bucket)**:
- `s3:PutObject` - Upload website files
- `s3:ListBucket` - List all files before deployment
- `s3:DeleteObject` - Clear bucket before deployment

**Bucket Policies**:
Both buckets need bucket policies to allow public read access (see Step 2.5 above)

**IAM Policy ARN**: Create custom policy as shown above
**User Name**: `aitor-content-manager-app`
