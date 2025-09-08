import chatbotTree from './chatbot-tree.json';

export interface TreeNode {
  id: string;
  message: string;
  type: 'multiple_choice' | 'ai_handoff';
  options: TreeOption[];
}

export interface TreeOption {
  text: string;
  value: string;
  nextId: string;
}

export interface DecisionTreeResponse {
  message: string;
  options: TreeOption[];
  nextNodeId?: string;
  shouldHandoffToAI?: boolean;
}

export class DecisionTreeEngine {
  private tree: Record<string, unknown>;

  constructor() {
    this.tree = chatbotTree;
  }

  getStartingNode(): TreeNode {
    return {
      id: this.tree.id,
      message: this.tree.message,
      type: this.tree.type,
      options: this.tree.options,
    };
  }

  processUserChoice(
    currentNodeId: string,
    userChoice: string
  ): DecisionTreeResponse {
    let currentNode;

    // Get current node
    if (currentNodeId === 'welcome') {
      currentNode = this.tree;
    } else {
      currentNode = this.tree.nodes[currentNodeId];
    }

    if (!currentNode) {
      return this.getErrorResponse();
    }

    // Find the selected option
    const selectedOption = currentNode.options.find(
      (option: TreeOption) => option.value === userChoice
    );

    if (!selectedOption) {
      return this.getErrorResponse();
    }

    // Get next node
    const nextNodeId = selectedOption.nextId;
    let nextNode;

    if (nextNodeId === 'welcome') {
      nextNode = this.tree;
    } else {
      nextNode = this.tree.nodes[nextNodeId];
    }

    if (!nextNode) {
      return this.getErrorResponse();
    }

    // Check if this is an AI handoff
    if (nextNode.type === 'ai_handoff') {
      return {
        message: nextNode.message,
        options: [],
        shouldHandoffToAI: true,
      };
    }

    return {
      message: nextNode.message,
      options: nextNode.options,
      nextNodeId: nextNodeId,
    };
  }

  private getErrorResponse(): DecisionTreeResponse {
    return {
      message: "I'm sorry, I didn't understand that choice. Let me start over.",
      options: this.tree.options,
      nextNodeId: 'welcome',
    };
  }

  getNodeById(nodeId: string): TreeNode | null {
    if (nodeId === 'welcome') {
      return {
        id: this.tree.id,
        message: this.tree.message,
        type: this.tree.type,
        options: this.tree.options,
      };
    }

    const node = this.tree.nodes[nodeId];
    if (!node) return null;

    return {
      id: node.id,
      message: node.message,
      type: node.type,
      options: node.options,
    };
  }
}
