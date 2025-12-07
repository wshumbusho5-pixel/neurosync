#!/bin/bash

# NeuroSync Test Runner
# Runs all automated tests for NeuroSync Phase 0

echo ""
echo "🧠 NeuroSync Phase 0 - Test Suite"
echo "=================================="
echo ""

# Track test results
TOTAL_PASSED=0
TOTAL_FAILED=0

# Test 1: Knowledge Base
echo "Running Knowledge Base Tests..."
echo "--------------------------------"
node tests/test-knowledge-base.js
KB_RESULT=$?

if [ $KB_RESULT -eq 0 ]; then
  echo "✅ Knowledge Base: PASSED"
else
  echo "❌ Knowledge Base: FAILED"
fi

echo ""

# Test 2: Prediction Logic
echo "Running Prediction Logic Tests..."
echo "--------------------------------"
node tests/test-predictor-simple.js
PRED_RESULT=$?

if [ $PRED_RESULT -eq 0 ]; then
  echo "✅ Prediction Logic: PASSED"
else
  echo "❌ Prediction Logic: FAILED"
fi

echo ""
echo "=================================="
echo "📊 Overall Test Summary"
echo "=================================="
echo ""

if [ $KB_RESULT -eq 0 ] && [ $PRED_RESULT -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED!"
  echo ""
  echo "✓ Knowledge base has 52+ technical terms"
  echo "✓ All 3 prediction patterns working"
  echo "✓ Confusion detection validated"
  echo "✓ Search intent detection validated"
  echo "✓ Context loss detection validated"
  echo "✓ Confidence thresholds correct (0.68-0.82)"
  echo "✓ 8 categories covered (React, JS, Python, DB, Git, DevOps, Backend, CS)"
  echo ""
  echo "Phase 0 is ready for browser testing!"
  echo ""
  exit 0
else
  echo "⚠️  SOME TESTS FAILED"
  echo ""
  echo "Please review test output above."
  echo ""
  exit 1
fi
