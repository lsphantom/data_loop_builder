# AWS Amplify Deployment Guide

## Prerequisites
- AWS Account with Amplify access
- GitHub repository with this code
- Basic familiarity with AWS Console

## Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. **Push code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add AWS Amplify configuration"
   git push origin main
   ```

2. **Connect to AWS Amplify**:
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Select "GitHub" as source
   - Choose your repository: `lsphantom/data_loop_builder`
   - Select branch: `main`

3. **Configure Build Settings**:
   - Amplify will auto-detect the `amplify.yml` file
   - Build artifacts will be served from `app/webapp/`
   - No additional configuration needed

4. **Deploy**:
   - Review settings and click "Save and deploy"
   - First deployment takes 2-5 minutes
   - You'll get a live URL: `https://[random-id].amplifyapp.com`

### Option 2: Manual ZIP Upload

1. **Create deployment package**:
   ```bash
   cd app/webapp
   zip -r ../data-loop-builder-deployment.zip .
   ```

2. **Upload to Amplify**:
   - Go to AWS Amplify Console
   - Choose "Deploy without Git provider"
   - Upload the ZIP file
   - Set app name: "Data Loop Builder"

## Configuration Details

### Build Configuration (amplify.yml)
- **Base Directory**: `app/webapp`
- **Build Command**: None required (static files)
- **Artifacts**: All files in webapp directory

### Custom Domain (Optional)
1. In Amplify Console, go to "Domain management"
2. Add your custom domain
3. Follow DNS verification steps
4. SSL certificate is automatically provisioned

## Environment Variables
No environment variables are required for this static application.

## Performance Optimization
- All processing happens client-side
- No server costs beyond hosting
- Automatic CDN distribution via CloudFront
- Auto-scaling based on traffic

## Monitoring
- Built-in Amplify analytics
- CloudWatch logs for access patterns
- Performance metrics dashboard

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that `amplify.yml` is in repository root
2. **404 errors**: Verify all relative paths in HTML/JS files
3. **Slow loading**: CDN resources may need time to propagate

### Support Resources:
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Amplify Console Troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting.html)

## Post-Deployment Testing
1. Test drag & drop functionality
2. Verify image processing works
3. Test download generation
4. Check responsive design on mobile
5. Validate all external CDN resources load

## Estimated Costs
- **Hosting**: ~$1-5/month for typical usage
- **Data Transfer**: Minimal for static assets
- **Build Minutes**: Free tier covers most use cases

---

**Ready to deploy!** Your app is optimized for Amplify hosting with client-side processing and no backend dependencies.