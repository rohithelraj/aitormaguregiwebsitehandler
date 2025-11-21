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
      "Sid": "AllowS3Upload",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
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

5. Click **Next**
6. Enter policy name: `AitorContentManagerS3Upload`
7. Enter description: `Allows upload to aitormaguregiportfolioresources S3 bucket`
8. Click **Create policy**
9. Go back to the user creation tab
10. Click refresh button on the policies list
11. Search for `AitorContentManagerS3Upload`
12. Check the box next to it
13. Click **Next**

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
- Ensure the policy includes `s3:PutObjectAcl` for public-read ACL

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

## Quick Reference

**Bucket**: `aitormaguregiportfolioresources`
**Region**: `us-east-1`
**Required Permissions**:
- `s3:PutObject` - Upload files
- `s3:PutObjectAcl` - Set public-read permission
- `s3:ListBucket` - List bucket contents (optional, for future features)

**IAM Policy ARN**: Create custom policy as shown above
**User Name**: `aitor-content-manager-app`
