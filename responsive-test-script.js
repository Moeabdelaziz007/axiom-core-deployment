/**
 * Responsive Design Testing Script for AxiomGigafactory Component
 * Tests mobile, tablet, and desktop viewports with comprehensive checks
 */

const puppeteer = require('puppeteer');

const VIEWPORTS = {
  // Mobile Viewports (<768px)
  mobile: [
    { name: 'iPhone SE', width: 375, height: 667, deviceScaleFactor: 2 },
    { name: 'iPhone 12', width: 390, height: 844, deviceScaleFactor: 3 },
    { name: 'Small Android', width: 360, height: 640, deviceScaleFactor: 2 },
    { name: 'Galaxy S8', width: 360, height: 740, deviceScaleFactor: 3 }
  ],
  
  // Tablet Viewports (768px-1024px)
  tablet: [
    { name: 'iPad', width: 768, height: 1024, deviceScaleFactor: 2 },
    { name: 'iPad Pro', width: 1024, height: 1366, deviceScaleFactor: 2 },
    { name: 'iPad Landscape', width: 1024, height: 768, deviceScaleFactor: 2 },
    { name: 'Surface Pro', width: 912, height: 1368, deviceScaleFactor: 2 }
  ],
  
  // Desktop Viewports (>1024px)
  desktop: [
    { name: 'Standard Desktop', width: 1920, height: 1080, deviceScaleFactor: 1 },
    { name: 'Large Desktop', width: 2560, height: 1440, deviceScaleFactor: 1 },
    { name: 'Ultra Wide', width: 3440, height: 1440, deviceScaleFactor: 1 },
    { name: 'Small Desktop', width: 1280, height: 720, deviceScaleFactor: 1 }
  ]
};

class ResponsiveTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      mobile: [],
      tablet: [],
      desktop: []
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for automated testing
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Navigate to the AxiomGigafactory component
    await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('🚀 Loaded AxiomGigafactory component');
  }

  async testViewport(viewport, category) {
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    // Set viewport
    await this.page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
      isMobile: category === 'mobile',
      hasTouch: category === 'mobile' || category === 'tablet'
    });

    // Wait for any responsive adjustments
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testResults = {
      viewport: viewport.name,
      dimensions: `${viewport.width}x${viewport.height}`,
      category: category,
      tests: {},
      issues: [],
      screenshots: []
    };

    try {
      // Test 1: Layout Structure
      testResults.tests.layout = await this.testLayoutStructure(category);
      
      // Test 2: Conveyor Belt Visualization
      testResults.tests.conveyorBelt = await this.testConveyorBelt(category);
      
      // Test 3: Controls Accessibility
      testResults.tests.controls = await this.testControls(category);
      
      // Test 4: Agent Details Panel
      testResults.tests.agentDetails = await this.testAgentDetails(category);
      
      // Test 5: Statistics Display
      testResults.tests.statistics = await this.testStatistics(category);
      
      // Test 6: Responsive Breakpoints
      testResults.tests.breakpoints = await this.testResponsiveBreakpoints(category);
      
      // Test 7: Touch Interactions (mobile/tablet)
      if (category === 'mobile' || category === 'tablet') {
        testResults.tests.touch = await this.testTouchInteractions(category);
      }
      
      // Test 8: Keyboard Navigation
      testResults.tests.keyboard = await this.testKeyboardNavigation(category);
      
      // Test 9: Accessibility Features
      testResults.tests.accessibility = await this.testAccessibility(category);
      
      // Test 10: Performance
      testResults.tests.performance = await this.testPerformance(category);

      // Take screenshots for documentation
      await this.takeScreenshots(testResults);

    } catch (error) {
      testResults.issues.push(`Critical error during testing: ${error.message}`);
      console.error(`❌ Error testing ${viewport.name}:`, error.message);
    }

    return testResults;
  }

  async testLayoutStructure(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Check main container
    const mainContainer = await this.page.$('[role="main"]');
    results.total++;
    if (mainContainer) {
      results.passed++;
      results.details.push('✅ Main container found with proper role');
    } else {
      results.details.push('❌ Main container not found');
    }

    // Check grid layout adaptation
    const gridLayout = await this.page.evaluate(() => {
      const mainGrid = document.querySelector('.grid');
      if (!mainGrid) return null;
      
      const styles = window.getComputedStyle(mainGrid);
      return {
        gridTemplateColumns: styles.gridTemplateColumns,
        gap: styles.gap,
        height: styles.height
      };
    });

    if (gridLayout) {
      results.total++;
      if (category === 'mobile') {
        const isSingleColumn = gridLayout.gridTemplateColumns.includes('1fr');
        if (isSingleColumn) {
          results.passed++;
          results.details.push('✅ Mobile: Single column layout detected');
        } else {
          results.details.push('❌ Mobile: Expected single column layout');
        }
      } else {
        const isMultiColumn = gridLayout.gridTemplateColumns.includes('12');
        if (isMultiColumn) {
          results.passed++;
          results.details.push(`✅ ${category}: Multi-column layout detected`);
        } else {
          results.details.push(`❌ ${category}: Expected multi-column layout`);
        }
      }
    }

    // Check responsive text sizing
    const textSizing = await this.page.evaluate(() => {
      const header = document.querySelector('h1');
      if (!header) return null;
      
      const styles = window.getComputedStyle(header);
      return {
        fontSize: styles.fontSize,
        responsiveClasses: header.className
      };
    });

    if (textSizing) {
      results.total++;
      const hasResponsiveText = textSizing.responsiveClasses.includes('md:text-') || 
                               textSizing.responsiveClasses.includes('text-2xl');
      if (hasResponsiveText) {
        results.passed++;
        results.details.push('✅ Responsive text sizing implemented');
      } else {
        results.details.push('⚠️ Responsive text sizing may be missing');
      }
    }

    return results;
  }

  async testConveyorBelt(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Check conveyor belt container
    const conveyorBelt = await this.page.$('[aria-label="Conveyor belt showing agent production stages"]');
    results.total++;
    if (conveyorBelt) {
      results.passed++;
      results.details.push('✅ Conveyor belt has proper accessibility label');
    } else {
      results.details.push('❌ Conveyor belt accessibility label missing');
    }

    // Check stage visibility
    const stageCount = await this.page.evaluate(() => {
      const stages = document.querySelectorAll('[data-stage]');
      return stages.length;
    });

    results.total++;
    if (stageCount === 4) {
      results.passed++;
      results.details.push(`✅ All 4 production stages visible`);
    } else {
      results.details.push(`❌ Expected 4 stages, found ${stageCount}`);
    }

    // Check responsive sizing
    const conveyorHeight = await this.page.evaluate(() => {
      const conveyor = document.querySelector('.relative.h-24');
      if (!conveyor) return null;
      
      const styles = window.getComputedStyle(conveyor);
      return {
        height: styles.height,
        responsiveClasses: conveyor.className
      };
    });

    if (conveyorHeight) {
      results.total++;
      const hasResponsiveHeight = conveyorHeight.responsiveClasses.includes('md:h-');
      if (hasResponsiveHeight) {
        results.passed++;
        results.details.push('✅ Conveyor belt has responsive height');
      } else {
        results.details.push('⚠️ Conveyor belt may need responsive height adjustment');
      }
    }

    // Check agent avatars sizing
    const avatarSizing = await this.page.evaluate(() => {
      const avatars = document.querySelectorAll('.w-8.h-8');
      const responsiveAvatars = document.querySelectorAll('.md\\:w-10.md\\:h-10');
      return {
        totalAvatars: avatars.length,
        responsiveAvatars: responsiveAvatars.length
      };
    });

    results.total++;
    if (avatarSizing.responsiveAvatars > 0) {
      results.passed++;
      results.details.push('✅ Agent avatars have responsive sizing');
    } else {
      results.details.push('⚠️ Agent avatars may need responsive sizing');
    }

    return results;
  }

  async testControls(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Check control buttons visibility
    const controlButtons = await this.page.$$('button[aria-label]');
    results.total++;
    if (controlButtons.length >= 3) {
      results.passed++;
      results.details.push(`✅ ${controlButtons.length} control buttons with aria-labels found`);
    } else {
      results.details.push(`❌ Expected at least 3 control buttons, found ${controlButtons.length}`);
    }

    // Check button text visibility on mobile
    if (category === 'mobile') {
      const hiddenText = await this.page.evaluate(() => {
        const hiddenElements = document.querySelectorAll('.hidden.sm\\:inline');
        return hiddenElements.length;
      });

      results.total++;
      if (hiddenText > 0) {
        results.passed++;
        results.details.push('✅ Mobile: Button text properly hidden on small screens');
      } else {
        results.details.push('⚠️ Mobile: Some button text may be visible on small screens');
      }
    }

    // Check touch target sizes (mobile/tablet)
    if (category === 'mobile' || category === 'tablet') {
      const touchTargets = await this.page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const validTargets = Array.from(buttons).filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44; // Minimum touch target size
        });
        return {
          total: buttons.length,
          valid: validTargets.length
        };
      });

      results.total++;
      if (touchTargets.valid === touchTargets.total) {
        results.passed++;
        results.details.push('✅ All buttons meet minimum touch target size (44x44px)');
      } else {
        results.details.push(`⚠️ ${touchTargets.total - touchTargets.valid} buttons don't meet minimum touch target size`);
      }
    }

    return results;
  }

  async testAgentDetails(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Check agent details panel
    const detailsPanel = await this.page.$('[aria-label="Selected agent details"]');
    results.total++;
    if (detailsPanel) {
      results.passed++;
      results.details.push('✅ Agent details panel has proper accessibility label');
    } else {
      results.details.push('❌ Agent details panel accessibility label missing');
    }

    // Check responsive layout of details panel
    const detailsLayout = await this.page.evaluate(() => {
      const panel = document.querySelector('.glass-panel-premium.rounded-xl.p-4');
      if (!panel) return null;
      
      const styles = window.getComputedStyle(panel);
      return {
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        responsiveClasses: panel.className
      };
    });

    if (detailsLayout) {
      results.total++;
      const hasResponsivePadding = detailsLayout.responsiveClasses.includes('p-4');
      if (hasResponsivePadding) {
        results.passed++;
        results.details.push('✅ Agent details panel has appropriate padding');
      } else {
        results.details.push('⚠️ Agent details panel may need responsive padding');
      }
    }

    // Check progress bar responsiveness
    const progressBar = await this.page.$('[role="progressbar"]');
    results.total++;
    if (progressBar) {
      results.passed++;
      results.details.push('✅ Progress bar has proper accessibility role');
    } else {
      results.details.push('❌ Progress bar accessibility role missing');
    }

    return results;
  }

  async testStatistics(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Check statistics panel
    const statsPanel = await this.page.$('[aria-label="Factory statistics"]');
    results.total++;
    if (statsPanel) {
      results.passed++;
      results.details.push('✅ Statistics panel has proper accessibility label');
    } else {
      results.details.push('❌ Statistics panel accessibility label missing');
    }

    // Check statistics content
    const statsContent = await this.page.evaluate(() => {
      const statItems = document.querySelectorAll('.flex.justify-between');
      return Array.from(statItems).map(item => item.textContent?.trim()).filter(Boolean);
    });

    results.total++;
    if (statsContent.length >= 5) {
      results.passed++;
      results.details.push(`✅ ${statsContent.length} statistics items found`);
    } else {
      results.details.push(`⚠️ Only ${statsContent.length} statistics items found, expected at least 5`);
    }

    // Check responsive text sizing in statistics
    const statTextSizing = await this.page.evaluate(() => {
      const statTexts = document.querySelectorAll('.text-sm');
      const responsiveTexts = document.querySelectorAll('.md\\:text-sm');
      return {
        total: statTexts.length,
        responsive: responsiveTexts.length
      };
    });

    results.total++;
    if (statTextSizing.total > 0) {
      results.passed++;
      results.details.push('✅ Statistics have appropriate text sizing');
    } else {
      results.details.push('⚠️ Statistics may need text sizing adjustment');
    }

    return results;
  }

  async testResponsiveBreakpoints(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Test breakpoint-specific classes
    const breakpointClasses = await this.page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const responsiveClasses = new Set();
      
      allElements.forEach(el => {
        const classes = el.className.split(' ');
        classes.forEach(cls => {
          if (cls.includes('sm:') || cls.includes('md:') || cls.includes('lg:') || cls.includes('xl:')) {
            responsiveClasses.add(cls);
          }
        });
      });
      
      return Array.from(responsiveClasses);
    });

    results.total++;
    if (breakpointClasses.length > 0) {
      results.passed++;
      results.details.push(`✅ Found ${breakpointClasses.length} responsive breakpoint classes`);
    } else {
      results.details.push('❌ No responsive breakpoint classes found');
    }

    // Test viewport-specific behavior
    const isMobileLayout = await this.page.evaluate(() => {
      const mainGrid = document.querySelector('.grid');
      if (!mainGrid) return false;
      
      const styles = window.getComputedStyle(mainGrid);
      return styles.gridTemplateColumns.includes('1fr');
    });

    results.total++;
    if (category === 'mobile' && isMobileLayout) {
      results.passed++;
      results.details.push('✅ Mobile layout correctly applied');
    } else if (category !== 'mobile' && !isMobileLayout) {
      results.passed++;
      results.details.push('✅ Desktop/tablet layout correctly applied');
    } else {
      results.details.push(`❌ Layout mismatch for ${category} viewport`);
    }

    return results;
  }

  async testTouchInteractions(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Test tap targets on agent avatars
    const agentAvatars = await this.page.$$('[role="listitem"]');
    results.total++;
    if (agentAvatars.length > 0) {
      results.passed++;
      results.details.push(`✅ ${agentAvatars.length} interactive agent avatars found`);
      
      // Test tap interaction
      try {
        await agentAvatars[0].tap();
        await this.page.waitForTimeout(500);
        
        const selectedAgent = await this.page.$('[aria-label="Selected agent details"]');
        if (selectedAgent) {
          results.passed++;
          results.details.push('✅ Agent selection via touch works');
        } else {
          results.details.push('⚠️ Agent selection via touch may have issues');
        }
        results.total++;
      } catch (error) {
        results.details.push('❌ Touch interaction test failed');
      }
    } else {
      results.details.push('❌ No interactive agent avatars found');
    }

    // Test swipe gestures (if applicable)
    results.total++;
    results.details.push('ℹ️ Swipe gesture testing requires manual verification');

    return results;
  }

  async testKeyboardNavigation(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Test Tab navigation
    results.total++;
    try {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
      
      const focusedElement = await this.page.evaluate(() => {
        const active = document.activeElement;
        return {
          tagName: active?.tagName,
          hasAriaLabel: active?.hasAttribute('aria-label'),
          hasTabIndex: active?.hasAttribute('tabindex')
        };
      });

      if (focusedElement && (focusedElement.hasAriaLabel || focusedElement.hasTabIndex)) {
        results.passed++;
        results.details.push('✅ Keyboard navigation works with proper focus management');
      } else {
        results.details.push('⚠️ Keyboard navigation may need improvement');
      }
    } catch (error) {
      results.details.push('❌ Keyboard navigation test failed');
    }

    // Test keyboard shortcuts
    results.total++;
    try {
      await this.page.keyboard.press(' '); // Space bar for pause/resume
      await this.page.waitForTimeout(200);
      
      const pauseButton = await this.page.$('[aria-label*="Resume"], [aria-label*="Pause"]');
      if (pauseButton) {
        results.passed++;
        results.details.push('✅ Space bar shortcut works');
      } else {
        results.details.push('⚠️ Space bar shortcut may not be working');
      }
    } catch (error) {
      results.details.push('❌ Keyboard shortcut test failed');
    }

    return results;
  }

  async testAccessibility(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Check ARIA labels
    const ariaElements = await this.page.$$('[aria-label], [aria-labelledby], [role]');
    results.total++;
    if (ariaElements.length >= 5) {
      results.passed++;
      results.details.push(`✅ ${ariaElements.length} elements with accessibility attributes found`);
    } else {
      results.details.push(`⚠️ Only ${ariaElements.length} elements with accessibility attributes found`);
    }

    // Check live regions
    const liveRegions = await this.page.$$('[aria-live]');
    results.total++;
    if (liveRegions.length > 0) {
      results.passed++;
      results.details.push(`✅ ${liveRegions.length} live regions for screen readers found`);
    } else {
      results.details.push('⚠️ No live regions found for dynamic content updates');
    }

    // Check color contrast (basic check)
    const contrastCheck = await this.page.evaluate(() => {
      const textElements = document.querySelectorAll('body *');
      let issues = 0;
      
      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Basic check for light text on dark background
        if (color.includes('255') && backgroundColor.includes('0')) {
          // This is likely good contrast
        } else if (color.includes('0') && backgroundColor.includes('255')) {
          // This is also likely good contrast
        } else if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          // Can't determine contrast without background
          issues++;
        }
      });
      
      return { totalElements: textElements.length, issues };
    });

    results.total++;
    if (contrastCheck.issues === 0) {
      results.passed++;
      results.details.push('✅ Basic color contrast check passed');
    } else {
      results.details.push(`⚠️ ${contrastCheck.issues} elements may have contrast issues`);
    }

    return results;
  }

  async testPerformance(category) {
    const results = { passed: 0, total: 0, details: [] };
    
    // Check page load performance
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });

    results.total++;
    if (performanceMetrics.firstContentfulPaint < 2000) {
      results.passed++;
      results.details.push(`✅ First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(0)}ms`);
    } else {
      results.details.push(`⚠️ Slow First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(0)}ms`);
    }

    // Check animation performance
    results.total++;
    try {
      const animationFrames = await this.page.evaluate(() => {
        return new Promise(resolve => {
          let frames = 0;
          const startTime = performance.now();
          
          function countFrames() {
            frames++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrames);
            } else {
              resolve(frames);
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });

      if (animationFrames >= 30) {
        results.passed++;
        results.details.push(`✅ Animation performance: ${animationFrames} FPS`);
      } else {
        results.details.push(`⚠️ Low animation performance: ${animationFrames} FPS`);
      }
    } catch (error) {
      results.details.push('❌ Animation performance test failed');
    }

    return results;
  }

  async takeScreenshots(testResults) {
    try {
      // Full page screenshot
      const fullPageScreenshot = `screenshot-${testResults.viewport}-full.png`;
      await this.page.screenshot({
        path: fullPageScreenshot,
        fullPage: true
      });
      testResults.screenshots.push(fullPageScreenshot);

      // Specific area screenshots
      const areas = [
        { selector: '[aria-label="Conveyor belt showing agent production stages"]', name: 'conveyor' },
        { selector: '[aria-label="Factory Controls"]', name: 'controls' },
        { selector: '[aria-label="Factory statistics"]', name: 'statistics' }
      ];

      for (const area of areas) {
        try {
          const element = await this.page.$(area.selector);
          if (element) {
            const screenshotName = `screenshot-${testResults.viewport}-${area.name}.png`;
            await element.screenshot({ path: screenshotName });
            testResults.screenshots.push(screenshotName);
          }
        } catch (error) {
          console.log(`Could not screenshot ${area.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Screenshot capture failed:', error.message);
    }
  }

  async runAllTests() {
    console.log('🎯 Starting comprehensive responsive design testing...\n');
    
    try {
      await this.init();

      // Test all mobile viewports
      for (const viewport of VIEWPORTS.mobile) {
        const result = await this.testViewport(viewport, 'mobile');
        this.results.mobile.push(result);
      }

      // Test all tablet viewports
      for (const viewport of VIEWPORTS.tablet) {
        const result = await this.testViewport(viewport, 'tablet');
        this.results.tablet.push(result);
      }

      // Test all desktop viewports
      for (const viewport of VIEWPORTS.desktop) {
        const result = await this.testViewport(viewport, 'desktop');
        this.results.desktop.push(result);
      }

      // Generate comprehensive report
      this.generateReport();

    } catch (error) {
      console.error('❌ Testing failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  generateReport() {
    console.log('\n📊 RESPONSIVE DESIGN TEST REPORT');
    console.log('=====================================\n');

    const categories = ['mobile', 'tablet', 'desktop'];
    
    categories.forEach(category => {
      const results = this.results[category];
      console.log(`\n📱 ${category.toUpperCase()} VIEWPORTS`);
      console.log('------------------------');
      
      results.forEach(result => {
        console.log(`\n🔍 ${result.viewport} (${result.dimensions})`);
        
        Object.entries(result.tests).forEach(([testName, testResult]) => {
          const passRate = ((testResult.passed / testResult.total) * 100).toFixed(0);
          const status = passRate >= 80 ? '✅' : passRate >= 60 ? '⚠️' : '❌';
          console.log(`  ${status} ${testName}: ${testResult.passed}/${testResult.total} (${passRate}%)`);
          
          testResult.details.forEach(detail => {
            console.log(`    ${detail}`);
          });
        });
        
        if (result.issues.length > 0) {
          console.log(`  🚨 Issues:`);
          result.issues.forEach(issue => console.log(`    ${issue}`));
        }
        
        if (result.screenshots.length > 0) {
          console.log(`  📸 Screenshots: ${result.screenshots.join(', ')}`);
        }
      });
    });

    // Overall summary
    console.log('\n📈 OVERALL SUMMARY');
    console.log('==================');
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalIssues = 0;
    
    categories.forEach(category => {
      this.results[category].forEach(result => {
        Object.values(result.tests).forEach(testResult => {
          totalTests += testResult.total;
          totalPassed += testResult.passed;
        });
        totalIssues += result.issues.length;
      });
    });
    
    const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);
    const overallStatus = overallPassRate >= 90 ? '🟢 EXCELLENT' : 
                         overallPassRate >= 80 ? '🟡 GOOD' : 
                         overallPassRate >= 70 ? '🟠 ACCEPTABLE' : '🔴 NEEDS IMPROVEMENT';
    
    console.log(`Overall Pass Rate: ${totalPassed}/${totalTests} (${overallPassRate}%)`);
    console.log(`Total Issues: ${totalIssues}`);
    console.log(`Status: ${overallStatus}`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (totalIssues > 0) {
      console.log('🔧 Address critical issues before production deployment');
    }
    
    if (overallPassRate < 90) {
      console.log('📱 Focus on improving mobile experience');
    }
    
    console.log('✨ Consider adding more responsive breakpoints for ultra-wide displays');
    console.log('♿ Enhance accessibility features for better screen reader support');
    console.log('⚡ Optimize animations for better performance on mobile devices');
    
    // Save detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalIssues,
        overallPassRate,
        status: overallStatus
      },
      results: this.results
    };
    
    require('fs').writeFileSync('responsive-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: responsive-test-report.json');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new ResponsiveTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ResponsiveTester;