# 🚀 Neural Workspace Quick Start Guide

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Target Audience:** New Users and Developers

---

## ⚡ 5-Minute Setup

### Prerequisites

- Node.js 18+ installed
- Axiom Core Deployment repository cloned
- Development environment configured

### Step 1: Start the Development Server

```bash
# Navigate to the project directory
cd axiom-core-deployment

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Step 2: Access Neural Workspace

Open your browser and navigate to:
```
http://localhost:3000/neural-workspace
```

### Step 3: Explore the Interface

You should see:
- 🧠 **Neural Workspace** header with gradient text
- 🟢 **Connection Status** indicator
- 🎮 **Control Panel** with Play/Pause and Reset buttons
- 📊 **Grid Layout** with 4 initial agents
- 📝 **Event Panel** showing real-time activities

---

## 🎯 Basic Usage

### Monitor Agent Activity

1. **Watch the agents** - They'll automatically start "thinking" with animated pulses
2. **Check connections** - Green lines show active data flow between agents
3. **View events** - Recent activities appear in the right panel

### Interact with Agents

1. **Click any agent** to select it
2. **View details** in the side panel (status, progress, current thought)
3. **Trigger actions** using the buttons:
   - **Start Task**: Begin general processing
   - **Analyze Data**: Trigger data analysis workflow

### Use Quick Actions

The Quick Actions panel provides one-click access to common tasks:

- 🌟 **Brainstorm Ideas**: Trigger Dreamer agent
- 📊 **Analyze Data**: Start Analyst agent
- ⚖️ **Make Decision**: Activate Judge agent
- 🔨 **Build System**: Initiate Builder agent

---

## 🔧 Common Tasks

### Reset the Workspace

Click the **Reset** button in the control panel to:
- Clear all events
- Reset all agents to idle state
- Deactivate all connections

### Change Grid Layout

Use the grid buttons to switch between:
- **3x3 Grid**: Larger cells, better for fewer agents
- **4x4 Grid**: Smaller cells, better for more agents

### Pause/Resume Updates

Toggle the **Play/Pause** button to:
- **Pause**: Stop real-time updates (agents freeze in current state)
- **Resume**: Continue receiving live updates

---

## 🐛 Troubleshooting Common Issues

### Connection Issues

**Problem**: Shows "Disconnected" status
**Solution**: 
1. Check if the development server is running
2. Refresh the page
3. Check browser console for errors

### Agents Not Responding

**Problem**: Clicking agents doesn't work
**Solution**:
1. Wait for initial connection to establish
2. Check if the agent is in "thinking" state
3. Try clicking a different agent

### No Events Showing

**Problem**: Event panel is empty
**Solution**:
1. Ensure connection status is "Connected"
2. Wait a few seconds for events to generate
3. Click Reset to clear and restart

---

## 📱 Mobile Usage

The Neural Workspace is fully responsive:

- **Touch Support**: Tap agents to select them
- **Swipe Gestures**: Scroll through event history
- **Adaptive Layout**: Grid adjusts to screen size

---

## 🔗 Next Steps

1. **Read the Full Guide**: [Neural Workspace Guide](./NEURAL_WORKSPACE_GUIDE.md)
2. **Check API Reference**: [API Documentation](./NEURAL_WORKSPACE_API_REFERENCE.md)
3. **Explore Integration**: Learn how to integrate with your systems
4. **Customize Agents**: Follow the development guide to add custom agents

---

## 💡 Pro Tips

### Keyboard Shortcuts

- **Space**: Play/Pause updates
- **R**: Reset workspace
- **Esc**: Deselect current agent
- **1-4**: Switch grid layouts

### Performance Tips

- **Close unused tabs** to improve performance
- **Use 4x4 grid** for better agent density
- **Pause updates** when not actively monitoring

### Advanced Usage

- **Open browser dev tools** to see detailed event logs
- **Monitor Network tab** for SSE connection status
- **Use Console** to trigger custom agent actions

---

## 🆘 Need Help?

- **Documentation**: Check the full [Neural Workspace Guide](./NEURAL_WORKSPACE_GUIDE.md)
- **API Reference**: Detailed [API Documentation](./NEURAL_WORKSPACE_API_REFERENCE.md)
- **Issues**: Report problems on the project repository
- **Discussions**: Join the development team conversations

---

## 🎉 You're Ready!

You now have a working Neural Workspace with:
- ✅ Real-time agent monitoring
- ✅ Interactive agent control
- ✅ Event history tracking
- ✅ Responsive design

Start exploring the agent swarm and watch the magic happen! 🧠✨

---

*Last Updated: November 2025*  
*Quick Start Version: 1.0.0*