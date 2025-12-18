/**
 * Jest Setup File
 * Configuration for testing environment
 */

// Mock DOM elements that might not be available in test environment
global.document = {
    getElementById: jest.fn(),
    createElement: jest.fn(),
    querySelectorAll: jest.fn(),
    addEventListener: jest.fn()
};

global.window = {
    addEventListener: jest.fn()
};

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Setup for property-based testing
global.fc = require('fast-check');

// Helper function to create mock DOM elements
global.createMockElement = (id, tagName = 'div') => {
    const element = {
        id: id,
        tagName: tagName,
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn()
        },
        innerHTML: '',
        textContent: '',
        addEventListener: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        appendChild: jest.fn(),
        children: []
    };
    return element;
};

// Mock getElementById to return mock elements
document.getElementById = jest.fn((id) => {
    return createMockElement(id);
});

// Mock createElement
document.createElement = jest.fn((tagName) => {
    return createMockElement('mock-element', tagName);
});

// Mock querySelectorAll
document.querySelectorAll = jest.fn(() => []);

beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});