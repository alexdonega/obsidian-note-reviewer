import '@testing-library/jest-dom';
import { Window } from 'happy-dom';

// Setup DOM para testes
const window = new Window();
global.document = window.document;
global.window = window as any;
global.navigator = window.navigator;
