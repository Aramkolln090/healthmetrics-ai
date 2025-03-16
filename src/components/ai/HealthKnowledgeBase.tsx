import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  FileText, 
  BookOpen, 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  Download, 
  Upload,
  InfoIcon
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ReactMarkdown from 'react-markdown';
import { saveKnowledgeBase, loadKnowledgeBase } from '@/lib/knowledge-context';

// For demonstration, let's define some initial sample health knowledge
const INITIAL_KNOWLEDGE_BASE = [
  {
    id: "1",
    title: "Blood Pressure Ranges",
    content: 
`# Blood Pressure Ranges

Normal blood pressure is considered to be below 120/80 mmHg.

## Categories:
- **Normal**: Less than 120/80 mmHg
- **Elevated**: 120-129/<80 mmHg
- **Stage 1 Hypertension**: 130-139/80-89 mmHg
- **Stage 2 Hypertension**: 140+/90+ mmHg
- **Hypertensive Crisis**: 180+/120+ mmHg (requires immediate medical attention)

Blood pressure should be measured regularly, especially for those with a family history of hypertension or heart disease.`,
    category: "cardiovascular",
    sources: "American Heart Association, 2022"
  },
  {
    id: "2",
    title: "Healthy BMI Range",
    content: 
`# Body Mass Index (BMI) Categories

BMI is calculated as weight (kg) divided by height squared (m²).

## Categories:
- **Underweight**: BMI less than 18.5
- **Normal weight**: BMI 18.5 to 24.9
- **Overweight**: BMI 25 to 29.9
- **Obesity Class I**: BMI 30 to 34.9
- **Obesity Class II**: BMI 35 to 39.9
- **Obesity Class III**: BMI 40 or higher

BMI is a screening tool and not diagnostic of body fatness or health.`,
    category: "weight",
    sources: "Centers for Disease Control and Prevention, 2023"
  },
  {
    id: "3",
    title: "Recommended Daily Water Intake",
    content: 
`# Daily Water Intake Recommendations

## General Guidelines:
- **Adult men**: About 15.5 cups (3.7 liters) of fluids per day
- **Adult women**: About 11.5 cups (2.7 liters) of fluids per day

## Factors that influence water needs:
- Exercise
- Environment (hot or humid weather)
- Illness or health conditions
- Pregnancy or breastfeeding

About 20% of daily fluid intake typically comes from food, with the rest from drinks.`,
    category: "hydration",
    sources: "Mayo Clinic, U.S. National Academies of Sciences, Engineering, and Medicine"
  }
];

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  sources: string;
}

export function HealthKnowledgeBase() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>(() => {
    // Try to load from local storage first, otherwise use initial data
    const storedKnowledge = loadKnowledgeBase();
    return storedKnowledge.length > 0 ? storedKnowledge : INITIAL_KNOWLEDGE_BASE;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Filter knowledge base entries based on search term and category
  const filteredEntries = knowledgeBase.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories from knowledge base
  const categories = ["all", ...new Set(knowledgeBase.map(entry => entry.category))];
  
  const handleAddNew = () => {
    setEditingEntry({
      id: Date.now().toString(),
      title: "",
      content: "",
      category: "",
      sources: ""
    });
    setIsAddingNew(true);
  };
  
  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingEntry({ ...entry });
    setIsAddingNew(false);
  };
  
  const handleSave = () => {
    if (!editingEntry) return;
    
    if (!editingEntry.title.trim() || !editingEntry.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }
    
    if (isAddingNew) {
      setKnowledgeBase([...knowledgeBase, editingEntry]);
      toast({
        title: "Success",
        description: "New knowledge entry added.",
      });
    } else {
      setKnowledgeBase(knowledgeBase.map(entry => 
        entry.id === editingEntry.id ? editingEntry : entry
      ));
      toast({
        title: "Success",
        description: "Knowledge entry updated.",
      });
    }
    
    setEditingEntry(null);
  };
  
  const handleDelete = (id: string) => {
    setKnowledgeBase(knowledgeBase.filter(entry => entry.id !== id));
    setEditingEntry(null);
    toast({
      title: "Success",
      description: "Knowledge entry deleted.",
    });
  };
  
  const handleExport = () => {
    const fileData = JSON.stringify(knowledgeBase, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "health_knowledge_base.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Knowledge base exported successfully.",
    });
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setKnowledgeBase(imported);
          toast({
            title: "Success",
            description: `Imported ${imported.length} knowledge entries.`,
          });
        } else {
          throw new Error("Invalid format");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import knowledge base. Invalid format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Update local storage whenever the knowledge base changes
  useEffect(() => {
    saveKnowledgeBase(knowledgeBase);
  }, [knowledgeBase]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-healthBlue-950 dark:text-healthBlue-200">
          Health Knowledge Base
        </h2>
        <div className="flex space-x-2">
          <Button variant="ghost" onClick={handleExport} title="Export Knowledge Base">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="relative">
            <Button variant="ghost" className="relative" title="Import Knowledge Base">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Browse Panel */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-healthBlue-700" />
                Browse Knowledge
              </CardTitle>
              <CardDescription>
                Search and explore the health information database
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Filter by Category</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filteredEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No entries found matching your criteria.
                  </p>
                ) : (
                  <Accordion type="single" collapsible>
                    {filteredEntries.map((entry) => (
                      <AccordionItem key={entry.id} value={entry.id}>
                        <AccordionTrigger className="text-left hover:bg-muted/50 px-2 rounded-md">
                          {entry.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Category: {entry.category}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(entry)}
                              >
                                Edit
                              </Button>
                            </div>
                            <div className="text-sm border-l-2 border-healthBlue-700 pl-2 mt-2 italic">
                              Source: {entry.sources}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-healthBlue-700 hover:bg-healthBlue-900"
                onClick={handleAddNew}
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Entry
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Content Panel */}
        <div className="md:col-span-2">
          {editingEntry ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAddingNew ? "Add New Knowledge Entry" : "Edit Knowledge Entry"}
                </CardTitle>
                <CardDescription>
                  {isAddingNew 
                    ? "Create a new entry in the health knowledge base" 
                    : "Update an existing entry in the health knowledge base"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingEntry.title}
                      onChange={(e) => setEditingEntry({...editingEntry, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Content (Markdown supported)</Label>
                      <a 
                        href="https://www.markdownguide.org/basic-syntax/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-healthBlue-700 hover:underline"
                      >
                        Markdown Help
                      </a>
                    </div>
                    <Textarea
                      id="content"
                      value={editingEntry.content}
                      onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={editingEntry.category}
                        onChange={(e) => setEditingEntry({...editingEntry, category: e.target.value.toLowerCase()})}
                        placeholder="e.g., nutrition, cardiovascular, hydration"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sources">Sources</Label>
                      <Input
                        id="sources"
                        value={editingEntry.sources}
                        onChange={(e) => setEditingEntry({...editingEntry, sources: e.target.value})}
                        placeholder="e.g., WHO Guidelines 2023, Mayo Clinic"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  {!isAddingNew && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the knowledge entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(editingEntry.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingEntry(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-healthBlue-700 hover:bg-healthBlue-900"
                  >
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : filteredEntries.length > 0 ? (
            <Tabs defaultValue={filteredEntries[0].id}>
              <TabsList className="mb-4 overflow-x-auto flex w-full max-w-full flex-nowrap">
                {filteredEntries.map((entry) => (
                  <TabsTrigger
                    key={entry.id}
                    value={entry.id}
                    className="whitespace-nowrap"
                  >
                    {entry.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {filteredEntries.map((entry) => (
                <TabsContent key={entry.id} value={entry.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-healthBlue-700" />
                            {entry.title}
                          </CardTitle>
                          <CardDescription>
                            Category: {entry.category}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {entry.content}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <InfoIcon className="h-4 w-4 mr-2" />
                        Source: {entry.sources}
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-card border rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Content Selected</h3>
              <p className="text-muted-foreground text-center mb-4">
                Select an entry from the knowledge base or add a new one to get started.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" /> Add New Entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 